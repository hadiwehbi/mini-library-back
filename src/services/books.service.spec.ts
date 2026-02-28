jest.mock('../prisma', () => ({
  prisma: {
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
  },
}));

import * as booksService from './books.service';
import { prisma } from '../prisma';
import { NotFoundError, ConflictError } from '../errors';

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

describe('BooksService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      (prisma.book.count as jest.Mock).mockResolvedValue(1);
      (prisma.book.findMany as jest.Mock).mockResolvedValue([mockBook]);

      const result = await booksService.findAll({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Book');
      expect(result.data[0].tags).toEqual(['test', 'book']);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);

      const result = await booksService.findOne('book-001');
      expect(result.title).toBe('Test Book');
    });

    it('should throw NotFoundError for non-existent book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(booksService.findOne('nonexistent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('create', () => {
    it('should create a book', async () => {
      (prisma.book.create as jest.Mock).mockResolvedValue(mockBook);
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const result = await booksService.create(
        { title: 'Test Book', author: 'Test Author' },
        'user-001',
      );

      expect(result.title).toBe('Test Book');
      expect(prisma.activityLog.create).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    it('should check out an available book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.book.update as jest.Mock).mockResolvedValue({
        ...mockBook,
        status: 'CHECKED_OUT',
        checkedOutByUserId: 'user-001',
      });
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const result = await booksService.checkout('book-001', 'user-001');
      expect(result.status).toBe('CHECKED_OUT');
    });

    it('should throw ConflictError for already checked out book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue({
        ...mockBook,
        status: 'CHECKED_OUT',
      });

      await expect(booksService.checkout('book-001', 'user-001')).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('checkin', () => {
    it('should check in a checked out book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue({
        ...mockBook,
        status: 'CHECKED_OUT',
        checkedOutByUserId: 'user-001',
      });
      (prisma.book.update as jest.Mock).mockResolvedValue({
        ...mockBook,
        status: 'AVAILABLE',
        checkedOutByUserId: null,
      });
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const result = await booksService.checkin('book-001', 'user-001');
      expect(result.status).toBe('AVAILABLE');
    });

    it('should throw ConflictError for non-checked-out book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);

      await expect(booksService.checkin('book-001', 'user-001')).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook);
      (prisma.book.delete as jest.Mock).mockResolvedValue(mockBook);
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      await booksService.deleteBook('book-001', 'admin-001');
      expect(prisma.book.delete).toHaveBeenCalledWith({
        where: { id: 'book-001' },
      });
    });
  });
});
