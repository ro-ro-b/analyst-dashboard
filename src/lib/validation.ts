import { z } from 'zod';

export const slugSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/);

export const filenameSchema = z.string().min(1).max(200).regex(/^[a-zA-Z0-9._-]+$/);

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
