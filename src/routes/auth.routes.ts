import { Router } from 'express';
import { devLogin, getMe } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { devLoginSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/auth/dev-login', validateBody(devLoginSchema), async (req, res, next) => {
  try {
    const result = await devLogin(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await getMe(req.user!.sub);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
