import { Router } from 'express';
import * as booksService from '../services/books.service';
import { authenticate } from '../middleware/auth';
import { requireRoles } from '../middleware/roles';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createBookSchema,
  updateBookSchema,
  bookQuerySchema,
} from '../schemas/book.schema';

const router = Router();

// All book routes require authentication
router.use(authenticate);

router.get('/', validateQuery(bookQuerySchema), async (req, res, next) => {
  try {
    const result = await booksService.findAll(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await booksService.findOne(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requireRoles('ADMIN', 'LIBRARIAN'),
  validateBody(createBookSchema),
  async (req, res, next) => {
    try {
      const result = await booksService.create(req.body, req.user!.sub);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  '/:id',
  requireRoles('ADMIN', 'LIBRARIAN'),
  validateBody(updateBookSchema),
  async (req, res, next) => {
    try {
      const result = await booksService.update(
        req.params.id as string,
        req.body,
        req.user!.sub,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  '/:id',
  requireRoles('ADMIN'),
  async (req, res, next) => {
    try {
      await booksService.deleteBook(req.params.id as string, req.user!.sub);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:id/checkout',
  requireRoles('ADMIN', 'LIBRARIAN'),
  async (req, res, next) => {
    try {
      const result = await booksService.checkout(req.params.id as string, req.user!.sub);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  '/:id/checkin',
  requireRoles('ADMIN', 'LIBRARIAN'),
  async (req, res, next) => {
    try {
      const result = await booksService.checkin(req.params.id as string, req.user!.sub);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
