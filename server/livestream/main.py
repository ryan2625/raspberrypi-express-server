import io
import asyncio
import time
from picamera2 import Picamera2
from picamera2.encoders import MJPEGEncoder, Quality
from picamera2.outputs import FileOutput
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from threading import Condition
from contextlib import asynccontextmanager
# see:  https://datasheets.raspberrypi.com/camera/picamera2-manual.pdf

max_streams = 2
timeout = 300
upTime = 0
class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        super().__init__()
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

    async def read(self):
        with self.condition:
            self.condition.wait()
            return self.frame


class JpegStream:
    def __init__(self):
        self.active = False
        self.connections = set()
        self.timeStampMap = {}
        self.activeStreams = 0
        self.maxStreams = max_streams
        self.masterSocket = None
        self.picam2 = None
        self.task = None

    async def stream_jpeg(self):
        self.picam2 = Picamera2()
        self.picam2.video_configuration.controls.FrameRate = 15.0
        self.picam2.video_configuration.size = (1920, 1080)
        output = StreamingOutput()
        self.picam2.start_recording(MJPEGEncoder(), FileOutput(output), Quality.VERY_LOW)

        try:
            while self.active:
                jpeg_data = await output.read()
                tasks = [
                    websocket.send_bytes(jpeg_data)
                    for websocket in self.connections.copy()
                ]
                if (self.picam2.frames % 100 == 0):
                    msgTasks = [
                        websocket.send_text(f"Frames reached: {self.picam2.frames}")
                        for websocket in self.connections.copy()
                    ]
                    await asyncio.gather(*msgTasks, return_exceptions=True)
                await asyncio.gather(*tasks, return_exceptions=True)
        finally:
            self.picam2.stop_recording()
            self.picam2.close()
            self.picam2 = None

    async def start(self):
        if not self.active:
            self.active = True
            self.task = asyncio.create_task(self.stream_jpeg())

    async def stop(self):
        if self.active:
            self.active = False
            if self.task:
                await self.task
                self.task = None

jpeg_stream = JpegStream()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("done")
    await jpeg_stream.stop()

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory='static'), name='static')

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # jpeg_stream.connections.add({"websocket": websocket, "timeStamp": time.time()})
    jpeg_stream.connections.add(websocket)
    jpeg_stream.timeStampMap[websocket] = time.time()
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        pass
    finally:
        jpeg_stream.connections.remove(websocket)
        if not jpeg_stream.connections:
            await jpeg_stream.stop()

@app.post("/start")
async def start_stream():
    await jpeg_stream.start()
    return {"message": "Stream started"}

@app.post("/stop")
async def stop_stream():
    await jpeg_stream.stop()
    return {"message": "Stream stopped"}

@app.get("/")
async def send_status():
    return {"message": "FastAPI online"}

@app.get("/connections")
async def send_connections():
    return {'connections': len(jpeg_stream.connections)}

@app.get("/frames")
async def send_connections():
    return {'connections': jpeg_stream.picam2.frames}
