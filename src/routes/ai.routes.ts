import { Router } from 'express';
import * as aiService from '../services/ai.service';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { suggestMetadataSchema, semanticSearchSchema } from '../schemas/ai.schema';

const router = Router();

router.use(authenticate);

router.post(
  '/suggest-metadata',
  validateBody(suggestMetadataSchema),
  async (req, res, next) => {
    try {
      const result = await aiService.suggestMetadata(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/semantic-search',
  validateBody(semanticSearchSchema),
  async (req, res, next) => {
    try {
      const result = await aiService.semanticSearch(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
