import { z } from 'zod';

export const suggestMetadataSchema = z.object({
  title: z.string().min(1, 'title is required'),
  author: z.string().optional(),
});

export type SuggestMetadataInput = z.infer<typeof suggestMetadataSchema>;

export const semanticSearchSchema = z.object({
  query: z.string().min(1, 'query is required'),
  limit: z.number().int().min(1).max(20).default(5),
});

export type SemanticSearchInput = z.infer<typeof semanticSearchSchema>;
