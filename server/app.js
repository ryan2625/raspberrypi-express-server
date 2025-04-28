import express from 'express';
import morgan from "morgan"
import cors from 'cors'
import expressWs from 'express-ws'
import { configDotenv } from 'dotenv'
import { types, open, message } from "./src/utilities/ws.js"
import { router as countRouter } from "./src/api/routes/count.js";
import { router as statsRouter } from "./src/api/routes/stats.js";
import { router as ledRouter } from "./src/api/routes/led.js"
import { router as controlRouter } from "./src/api/routes/control.js"

export const app = express()
expressWs(app)
configDotenv()

const port = process.env.EXPRESS_PORT
const corsOptions = {
  origin: 'https://mjpeg.westbrookpermaban.uk',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}

app.use(cors(corsOptions));
app.use(morgan("combined"))
app.use(express.json())

app.use('/count', countRouter);
app.use('/stats', statsRouter);
app.use('/led', ledRouter)
app.use('/control', controlRouter)

app.get('/', (req, res) => {
  res.send("Hello world!");
});

app.ws('/ws', (ws, req) => {
  const s = ws
  ws.on(types.OPEN, open)
  ws.on(types.MSG, (msg) => { message(msg, s) })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server waiting at ${port}`);
});