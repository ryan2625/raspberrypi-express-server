import { Gpio } from "onoff";
const led = new Gpio(529, 'out')
let status = 0

export async function toggleLed(req, res) {
  status = (status ? 0 : 1)
  led.writeSync(status)
  res.json({ success: "true" })
}