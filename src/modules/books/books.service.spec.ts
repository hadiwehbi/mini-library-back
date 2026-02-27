import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BooksService } from './books.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('BooksService', () => {
  let service: BooksService;

  const mockBook = {
    id: 'book-001',
    title: 'Test Book',
    author: 'Test Author',
    status: 'AVAILABLE',
    isbn: '978-0000000000',
    genre: 'Technology',
    publishedYear: 2024,
    tags: '["test","book"]',
    description: 'A test book',
    coverImageUrl: null,
    checkedOutByUserId: null,
    checkedOutAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    book: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      mockPrisma.book.count.mockResolvedValue(1);
      mockPrisma.book.findMany.mockResolvedValue([mockBook]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Book');
      expect(result.data[0].tags).toEqual(['test', 'book']);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(mockBook);

      const result = await service.findOne('book-001');
      expect(result.title).toBe('Test Book');
    });

    it('should throw NotFoundException for non-existent book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a book', async () => {
      mockPrisma.book.create.mockResolvedValue(mockBook);
      mockPrisma.activityLog.create.mockResolvedValue({});

      const result = await service.create(
        { title: 'Test Book', author: 'Test Author' },
        'user-001',
      );

      expect(result.title).toBe('Test Book');
      expect(mockPrisma.activityLog.create).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should check out an available book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(mockBook);
      mockPrisma.book.update.mockResolvedValue({
        ...mockBook,
        status: 'CHECKED_OUT',
        checkedOutByUserId: 'user-001',
      });
      mockPrisma.activityLog.create.mockResolvedValue({});

      const result = await service.checkout('book-001', 'user-001');
      expect(result.status).toBe('CHECKED_OUT');
    });

    it('should throw ConflictException for already checked out book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue({
        ...mockBook,
        status: 'CHECKED_OUT',
      });

      await expect(service.checkout('book-001', 'user-001')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('checkin', () => {
    it('should check in a checked out book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue({
        ...mockBook,
        status: 'CHECKED_OUT',
        checkedOutByUserId: 'user-001',
      });
      mockPrisma.book.update.mockResolvedValue({
        ...mockBook,
        status: 'AVAILABLE',
        checkedOutByUserId: null,
      });
      mockPrisma.activityLog.create.mockResolvedValue({});

      const result = await service.checkin('book-001', 'user-001');
      expect(result.status).toBe('AVAILABLE');
    });

    it('should throw ConflictException for non-checked-out book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(mockBook);

      await expect(service.checkin('book-001', 'user-001')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(mockBook);
      mockPrisma.book.delete.mockResolvedValue(mockBook);
      mockPrisma.activityLog.create.mockResolvedValue({});

      await service.delete('book-001', 'admin-001');
      expect(mockPrisma.book.delete).toHaveBeenCalledWith({
        where: { id: 'book-001' },
      });
    });
  });
});
