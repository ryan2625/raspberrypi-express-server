import io
from picamera2 import Picamera2
from picamera2.encoders import MJPEGEncoder, Quality
from picamera2.outputs import FileOutput
from fastapi import FastAPI
from starlette.background import BackgroundTask
from fastapi.responses import Response, StreamingResponse
from threading import Condition
import logging

app = FastAPI()
picam2 = None

def get_camera():
    global picam2
    if picam2 is None:
        try:
            picam2 = Picamera2()
        except Exception as e:
            logging.error(f"Error initializing camera: {str(e)}")
    return picam2

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

    def read(self):
        with self.condition:
            self.condition.wait()
            return self.frame

def generate_frames(output):
    while True:
        try:
            frame = output.read()
            yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
        except Exception as e:
            logging.error(f"Error in generate_frames: {str(e)}")
            break
    print("done")

@app.on_event("startup")
async def startup_event():
    get_camera()

@app.on_event("shutdown")
async def shutdown_event():
    global picam2
    if picam2 is not None:
        try:
            picam2.close()
        except:
            pass
        picam2 = None

@app.get("/")
def root():
    return {"message": "Camera API is running"}

@app.get("/mjpeg")
async def mjpeg():
    camera = get_camera()
    if camera is None:
        return Response(content="Camera not available", media_type="text/plain", status_code=500)
    
    try:
        output = StreamingOutput()
        video_config = camera.create_video_configuration(main={"size": (1280, 720)})
        camera.configure(video_config)
        
        try:
            camera.stop_recording()
        except:
            pass
            
        camera.start_recording(MJPEGEncoder(), FileOutput(output), Quality.VERY_HIGH)
        
        def stop():
            try:
                camera.stop_recording()
            except:
                pass
                
        return StreamingResponse(
            generate_frames(output),
            media_type="multipart/x-mixed-replace; boundary=frame",
            background=BackgroundTask(stop),
        )
    except Exception as e:
        logging.error(f"Error starting video stream: {str(e)}")
        return Response(content=f"Error: {str(e)}", media_type="text/plain", status_code=500)