import express from 'express';
import { addRealCount, getRealCount } from "../../services/count.js";

export const router = express.Router();

router.get('/', getRealCount);
router.get('/add', addRealCount);
