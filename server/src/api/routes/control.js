import express from 'express'
import { authenticate } from '../../services/control.js'
export const router = new express.Router()

router.post('/authenticate', authenticate)
