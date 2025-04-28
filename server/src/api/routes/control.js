import express from 'express'
import { authenticate, testAuth, confirmAuth } from '../../services/control.js'
export const router = new express.Router()

router.post('/authenticate', authenticate)
router.get('/test', testAuth, confirmAuth)