import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';
import { BookResponseDto, PaginatedBooksResponseDto } from './dto/book-response.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: BookQueryDto): Promise<PaginatedBooksResponseDto> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      q,
      status,
      genre,
      author,
    } = query;

    const where: any = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Genre filter
    if (genre) {
      where.genre = { contains: genre };
    }

    // Author filter
    if (author) {
      where.author = { contains: author };
    }

    // Full text search across multiple fields
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { author: { contains: q } },
        { genre: { contains: q } },
        { isbn: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Validate sortBy field
    const allowedSortFields = [
      'title',
      'author',
      'createdAt',
      'updatedAt',
      'publishedYear',
      'status',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';

    const [total, books] = await Promise.all([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: books.map((b) => this.toResponse(b)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with id '${id}' not found`);
    }
    return this.toResponse(book);
  }

  async create(dto: CreateBookDto, actorUserId: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        isbn: dto.isbn,
        genre: dto.genre,
        publishedYear: dto.publishedYear,
        tags: dto.tags ? JSON.stringify(dto.tags) : null,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
      },
    });

    await this.logActivity('BOOK_CREATED', book.id, actorUserId, {
      title: book.title,
    });

    return this.toResponse(book);
  }

  async update(
    id: string,
    dto: UpdateBookDto,
    actorUserId: string,
  ): Promise<BookResponseDto> {
    await this.findOne(id); // ensure exists

    const data: any = { ...dto };
    if (dto.tags !== undefined) {
      data.tags = dto.tags ? JSON.stringify(dto.tags) : null;
    }

    const book = await this.prisma.book.update({
      where: { id },
      data,
    });

    await this.logActivity('BOOK_UPDATED', book.id, actorUserId, {
      updatedFields: Object.keys(dto),
    });

    return this.toResponse(book);
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    const book = await this.findOne(id); // ensure exists

    await this.prisma.book.delete({ where: { id } });

    await this.logActivity('BOOK_DELETED', id, actorUserId, {
      title: book.title,
    });
  }

  async checkout(id: string, actorUserId: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with id '${id}' not found`);
    }

    if (book.status === 'CHECKED_OUT') {
      throw new ConflictException(
        `Book '${book.title}' is already checked out`,
      );
    }

    const updated = await this.prisma.book.update({
      where: { id },
      data: {
        status: 'CHECKED_OUT',
        checkedOutByUserId: actorUserId,
        checkedOutAt: new Date(),
      },
    });

    await this.logActivity('BOOK_CHECKED_OUT', id, actorUserId, {
      title: book.title,
    });

    return this.toResponse(updated);
  }

  async checkin(id: string, actorUserId: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with id '${id}' not found`);
    }

    if (book.status !== 'CHECKED_OUT') {
      throw new ConflictException(`Book '${book.title}' is not checked out`);
    }

    const updated = await this.prisma.book.update({
      where: { id },
      data: {
        status: 'AVAILABLE',
        checkedOutByUserId: null,
        checkedOutAt: null,
      },
    });

    await this.logActivity('BOOK_CHECKED_IN', id, actorUserId, {
      title: book.title,
      previousHolder: book.checkedOutByUserId,
    });

    return this.toResponse(updated);
  }

  private async logActivity(
    type: string,
    bookId: string,
    actorUserId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.activityLog.create({
      data: {
        type,
        bookId,
        actorUserId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  private toResponse(book: any): BookResponseDto {
    return {
      ...book,
      tags: book.tags ? JSON.parse(book.tags) : null,
    };
  }
}
