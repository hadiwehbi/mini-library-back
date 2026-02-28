import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1, 'title is required'),
  author: z.string().min(1, 'author is required'),
  isbn: z.string().optional(),
  genre: z.string().optional(),
  publishedYear: z.number().int().min(0).max(2100).optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().url('Must be a valid URL').optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

export const updateBookSchema = createBookSchema.partial();

export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['title', 'author', 'createdAt', 'updatedAt', 'publishedYear', 'status'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().optional(),
  status: z.enum(['AVAILABLE', 'CHECKED_OUT']).optional(),
  genre: z.string().optional(),
  author: z.string().optional(),
});

export type BookQueryInput = z.infer<typeof bookQuerySchema>;
