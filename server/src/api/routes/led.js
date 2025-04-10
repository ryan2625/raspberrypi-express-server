import express from 'express'
import { toggleLed } from '../../services/led.js'

export const router = express.Router()

router.get('/', toggleLed)