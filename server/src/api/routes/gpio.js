import express from 'express'
import { toggleLed } from '../../services/gpio.js'
import { toggleCat, toggleCat2, writei2c, flashBacklight, writeToOLED } from '../../services/gpio.js'

export const router = express.Router()

router.get('/', toggleLed)
router.get('/activate', toggleCat)
router.get('/activate2', toggleCat2)
router.get('/flashBack', flashBacklight)
router.get('/oled', writeToOLED)

router.post('/write', writei2c)
