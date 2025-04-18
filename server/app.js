import express from 'express';
import morgan from "morgan"
import cors from 'cors'
import { router as countRouter } from "./src/api/routes/count.js";
import { router as statsRouter } from "./src/api/routes/stats.js";
import { router as ledRouter } from "./src/api/routes/led.js"
import { configDotenv } from 'dotenv'

configDotenv()
const app = express();
const port = process.env.EXPRESS_PORT
const corsOptions = {
  origin: 'https://mjpeg.westbrookpermaban.uk',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}

app.use(cors(corsOptions));
app.use(morgan("combined"))

app.use('/count', countRouter);
app.use('/stats', statsRouter);
app.use('/led', ledRouter)

app.get('/', (req, res) => {
  res.send("Hello world!");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server waiting at ${port}`);
});