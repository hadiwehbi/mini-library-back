import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AiService', () => {
  let service: AiService;

  const mockConfig = {
    aiProvider: 'mock',
  };

  const mockPrisma = {
    book: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfig },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('suggestMetadata', () => {
    it('should suggest technology genre for programming books', async () => {
      const result = await service.suggestMetadata({
        title: 'The Pragmatic Programmer',
        author: 'David Thomas',
      });

      expect(result.genre).toContain('Technology');
      expect(result.tags).toContain('programming');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.provider).toBe('mock');
    });

    it('should return general fiction for unknown titles', async () => {
      const result = await service.suggestMetadata({
        title: 'My Random Book',
      });

      expect(result.genre).toBe('General Fiction');
      expect(result.provider).toBe('mock');
    });
  });

  describe('semanticSearch', () => {
    it('should return matching books', async () => {
      mockPrisma.book.findMany.mockResolvedValue([
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

      const result = await service.semanticSearch({
        query: 'clean code programming',
        limit: 5,
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].title).toBe('Clean Code');
      expect(result.provider).toBe('mock');
    });
  });
});
