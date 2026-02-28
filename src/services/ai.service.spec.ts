jest.mock('../prisma', () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../config', () => ({
  config: {
    aiProvider: 'mock',
  },
}));

import * as aiService from './ai.service';
import { prisma } from '../prisma';

describe('AiService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('suggestMetadata', () => {
    it('should suggest technology genre for programming books', async () => {
      const result = await aiService.suggestMetadata({
        title: 'The Pragmatic Programmer',
        author: 'David Thomas',
      });

      expect(result.genre).toContain('Technology');
      expect(result.tags).toContain('programming');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.provider).toBe('mock');
    });

    it('should return general fiction for unknown titles', async () => {
      const result = await aiService.suggestMetadata({
        title: 'My Random Book',
      });

      expect(result.genre).toBe('General Fiction');
      expect(result.provider).toBe('mock');
    });
  });

  describe('semanticSearch', () => {
    it('should return matching books', async () => {
      (prisma.book.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'book-001',
          title: 'Clean Code',
          author: 'Robert Martin',
          genre: 'Technology',
          description: 'Writing clean code',
          tags: '["programming"]',
        },
        {
          id: 'book-002',
          title: 'Dune',
          author: 'Frank Herbert',
          genre: 'Sci-Fi',
          description: 'Desert planet',
          tags: '["sci-fi"]',
        },
      ]);

      const result = await aiService.semanticSearch({
        query: 'clean code programming',
        limit: 5,
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].title).toBe('Clean Code');
      expect(result.provider).toBe('mock');
    });
  });
});
