import { z } from 'zod';

export const devLoginSchema = z.object({
  sub: z.string().min(1, 'sub is required'),
  email: z.string().email('Must be a valid email'),
  name: z.string().min(1, 'name is required'),
  role: z.enum(['ADMIN', 'LIBRARIAN', 'MEMBER']),
});

export type DevLoginInput = z.infer<typeof devLoginSchema>;
