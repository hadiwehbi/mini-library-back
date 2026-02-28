import { Router } from 'express';
import { config } from '../config';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
