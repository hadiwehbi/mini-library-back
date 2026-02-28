import { prisma } from '../prisma';
import { NotFoundError, ConflictError } from '../errors';
import { CreateBookInput, UpdateBookInput, BookQueryInput } from '../schemas/book.schema';

function toResponse(book: any) {
  return {
    ...book,
    tags: book.tags ? JSON.parse(book.tags) : null,
  };
}

async function logActivity(
  type: string,
  bookId: string,
  actorUserId: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.activityLog.create({
    data: {
      type,
      bookId,
      actorUserId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });
}

export async function findAll(query: BookQueryInput) {
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

  if (status) where.status = status;
  if (genre) where.genre = { contains: genre };
  if (author) where.author = { contains: author };

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

  const [total, books] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: books.map(toResponse),
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

export async function findOne(id: string) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new NotFoundError(`Book with id '${id}' not found`);
  return toResponse(book);
}

export async function create(dto: CreateBookInput, actorUserId: string) {
  const book = await prisma.book.create({
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

  await logActivity('BOOK_CREATED', book.id, actorUserId, {
    title: book.title,
  });

  return toResponse(book);
}

export async function update(
  id: string,
  dto: UpdateBookInput,
  actorUserId: string,
) {
  await findOne(id);

  const data: any = { ...dto };
  if (dto.tags !== undefined) {
    data.tags = dto.tags ? JSON.stringify(dto.tags) : null;
  }

  const book = await prisma.book.update({ where: { id }, data });

  await logActivity('BOOK_UPDATED', book.id, actorUserId, {
    updatedFields: Object.keys(dto),
  });

  return toResponse(book);
}

export async function deleteBook(id: string, actorUserId: string) {
  const book = await findOne(id);
  await prisma.book.delete({ where: { id } });
  await logActivity('BOOK_DELETED', id, actorUserId, { title: book.title });
}

export async function checkout(id: string, actorUserId: string) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new NotFoundError(`Book with id '${id}' not found`);
  if (book.status === 'CHECKED_OUT') {
    throw new ConflictError(`Book '${book.title}' is already checked out`);
  }

  const updated = await prisma.book.update({
    where: { id },
    data: {
      status: 'CHECKED_OUT',
      checkedOutByUserId: actorUserId,
      checkedOutAt: new Date(),
    },
  });

  await logActivity('BOOK_CHECKED_OUT', id, actorUserId, {
    title: book.title,
  });

  return toResponse(updated);
}

export async function checkin(id: string, actorUserId: string) {
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new NotFoundError(`Book with id '${id}' not found`);
  if (book.status !== 'CHECKED_OUT') {
    throw new ConflictError(`Book '${book.title}' is not checked out`);
  }

  const updated = await prisma.book.update({
    where: { id },
    data: {
      status: 'AVAILABLE',
      checkedOutByUserId: null,
      checkedOutAt: null,
    },
  });

  await logActivity('BOOK_CHECKED_IN', id, actorUserId, {
    title: book.title,
    previousHolder: book.checkedOutByUserId,
  });

  return toResponse(updated);
}
