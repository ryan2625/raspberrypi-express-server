import { Gpio } from "onoff"
import i2c from 'i2c-bus'
import sleep from 'sleep'
import OLED from 'oled-i2c-bus'
import font from 'oled-font-5x7'
// Pin = pin # + 512
const led = new Gpio(529, 'out')
const cat = new Gpio(536, 'out')

const I2C_ADDR = 0x27 // I2C Backpack address
const I2C_BUS_NBR = 1 // Pi I2C Bus #
const I2C_BACKLIGHT = 0x08 // Backlight control bit
const I2C_REG_SELECT_CMD = 0x00 // 0 sends to command register
const I2C_REG_SELECT_CHAR = 0x01 // 1 sends to character/data register
const I2C_ENABLE = 0x04 // Bit to enable LCD 

const I2C_OLED_ADDR = 0x3C
// https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/5773/CN0295D%20DATASHEET.pdf
let status = 0
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function toggleLed(req, res) {
  status = (status ? 0 : 1)
  led.writeSync(status)
  res.json({ success: "true" })
}

export async function toggleCat(req, res) {
  cat.writeSync(1)
  await delay(250)
  cat.writeSync(0)
  res.json({ success: 'true' })
}

export async function toggleCat2(req, res) {
  status = (status ? 0 : 1)
  cat.writeSync(status)
  res.json({ success: 'true' })
}

const i2cBus = i2c.open(I2C_BUS_NBR, async function (err) {
  if (err) {
    console.log("Critical I2C bus error: ", err)
    process.exit(1)
  }
  await initializei2c()
  // Position cursor at 0,0 row 1 col 1
  positionCursor(0, 0)
})

const oled = new OLED(i2cBus, {
  width: 128,
  height: 64,
  address: 0x3C,
  bus: 1,
  driver: 'SSD1306'
});

export async function writei2c(req, res) {
  positionCursor(0, 0)
  let s = 'WELCOME'
  await writeStringToI2C(s)
  await delay(250)
  positionCursor(1, 0)
  await writeStringToI2C(req?.body?.name.toUpperCase())
  await writeStringToI2C('...')
  let i = intervalPeriod()
  await delay(5000)
  clearInterval(i)
  clearDisplay()
  res.json({ success: "true lol" })
}

async function intervalPeriod() {
  let c = true
  const periodInterval = setInterval(async () => {
    c === true ? await writeStringToI2C('') : await writeStringToI2C('.')
  }, 100)
  return periodInterval
}

export async function flashBacklight(req, res) {
  res.json({ success: 'true' })
  var t = true
  const i = setInterval(function () {
    i2cBacklight(!t)
    t = !t
  }, 250)
  await delay(2250)
  clearInterval(i)
}

export function writeToOLED(req, res, text) {
  oled.clearDisplay();
  oled.setCursor(1, 1);
  oled.writeString(font, 1, 'Cats and dog', 1, true);
  oled.update();
  res.json({ success: "true" })
}

async function rawTimedWrite(dataInUpperNibble, cmndOrChar) {
  let cleanData = dataInUpperNibble & 0xf0
  let cleanRS = cmndOrChar & 0x1
  i2cBus.i2cWrite(I2C_ADDR, 1, Buffer.from([cleanData | I2C_BACKLIGHT | cleanRS]), handlei2cErr)
  i2cBus.i2cWrite(I2C_ADDR, 1, Buffer.from([cleanData | I2C_BACKLIGHT | I2C_ENABLE | cleanRS]), handlei2cErr)
  i2cBus.i2cWrite(I2C_ADDR, 1, Buffer.from([cleanData | I2C_BACKLIGHT | cleanRS]), handlei2cErr)
  await delay(10)
}

async function initializei2c() {
  await delay(50);
  // Set of pulsating 3s to reset & initialize with precise timings...
  await rawTimedWrite(0x30, I2C_REG_SELECT_CMD);
  await sleep.usleep(4500);

  await rawTimedWrite(0x30, I2C_REG_SELECT_CMD);
  await sleep.usleep(150);

  await rawTimedWrite(0x30, I2C_REG_SELECT_CMD);
  await sleep.usleep(50);

  await rawTimedWrite(0x20, I2C_REG_SELECT_CMD);
  await sleep.usleep(50);
  //Defines the number of display lines N and font F??
  await rawTimedWrite(0x20, I2C_REG_SELECT_CMD);
  await rawTimedWrite(0x80, I2C_REG_SELECT_CMD);
  await sleep.usleep(50);
  // Unexplainable bits the datasheet insisted I send
  await rawTimedWrite(0x00, I2C_REG_SELECT_CMD);
  await rawTimedWrite(0x80, I2C_REG_SELECT_CMD);
  await sleep.usleep(50);

  await rawTimedWrite(0x00, I2C_REG_SELECT_CMD);
  await rawTimedWrite(0x10, I2C_REG_SELECT_CMD);
  await sleep.usleep(2000);

  await rawTimedWrite(0x00, I2C_REG_SELECT_CMD);
  //Set cursor and display movement properties (?) This means it does NOT scroll
  await rawTimedWrite(0x60, I2C_REG_SELECT_CMD);
  await sleep.usleep(50);

  await rawTimedWrite(0x00, I2C_REG_SELECT_CMD);
  await rawTimedWrite(0xC0, I2C_REG_SELECT_CMD);
  await sleep.usleep(50);
}

function positionCursor(row, col) {
  //Make sure this is a 0 for top line and 1 for bottom line??
  let cleanRow = row & 1
  // I have no idea what I'm doing
  let cleanCol = col & 0xf
  // Send values to I2C display with bit shift ?
  rawTimedWrite((0x80 | (cleanRow << 6)), I2C_REG_SELECT_CMD)
  rawTimedWrite((cleanCol << 4), I2C_REG_SELECT_CMD)
}

async function writeStringToI2C(displayString, t = 75) {
  for (const char of displayString.split('')) {
    let dataToSend = char.charCodeAt(0)
    rawTimedWrite((dataToSend & 0xf0), I2C_REG_SELECT_CHAR)
    rawTimedWrite(((dataToSend << 4) & 0xf0), I2C_REG_SELECT_CHAR)
    await delay(t)
  }
}

async function clearDisplay() {
  await rawTimedWrite(0x00, I2C_REG_SELECT_CMD)
  await rawTimedWrite(0x10, I2C_REG_SELECT_CMD)
}

function i2cBacklight(onOff) {
  if (onOff) {
    i2cBus.i2cWrite(I2C_ADDR, 1, Buffer.from([I2C_BACKLIGHT]),
      handlei2cErr
    )
  } else {
    i2cBus.i2cWrite(I2C_ADDR, 1, Buffer.from([0]),
      handlei2cErr
    )
  }
}

function handlei2cErr(err, bytesWritten, buffer) {
  if (err) {
    console.log("Error writing to I2C bus: ", err)
  }
}

// export function writei2c() {

// }
// export function flashBacklight() {

// }
// export function writeToOLED() {

// }