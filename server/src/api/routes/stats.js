import express from "express";
import { getSystemStats } from "../../services/stats.js";

export const router = express.Router()

router.get('/', getSystemStats)
