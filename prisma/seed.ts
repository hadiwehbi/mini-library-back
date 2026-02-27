import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const admin = await prisma.user.upsert({
    where: { id: 'admin-001' },
    update: {},
    create: {
      id: 'admin-001',
      email: 'admin@library.local',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const librarian = await prisma.user.upsert({
    where: { id: 'librarian-001' },
    update: {},
    create: {
      id: 'librarian-001',
      email: 'librarian@library.local',
      name: 'Jane Librarian',
      role: 'LIBRARIAN',
    },
  });

  const member = await prisma.user.upsert({
    where: { id: 'member-001' },
    update: {},
    create: {
      id: 'member-001',
      email: 'member@library.local',
      name: 'John Member',
      role: 'MEMBER',
    },
  });

  // Create books
  const books = [
    {
      id: 'book-001',
      title: 'The Pragmatic Programmer',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      genre: 'Technology',
      publishedYear: 2019,
      tags: JSON.stringify(['programming', 'software-engineering', 'best-practices']),
      description:
        'Your journey to mastery. A classic guide to software development best practices.',
    },
    {
      id: 'book-002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      genre: 'Technology',
      publishedYear: 2008,
      tags: JSON.stringify(['programming', 'clean-code', 'refactoring']),
      description:
        'A handbook of agile software craftsmanship for writing readable and maintainable code.',
    },
    {
      id: 'book-003',
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441013593',
      genre: 'Science Fiction',
      publishedYear: 1965,
      tags: JSON.stringify(['sci-fi', 'classic', 'desert', 'politics']),
      description:
        'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides.',
    },
    {
      id: 'book-004',
      title: 'Design Patterns',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '978-0201633610',
      genre: 'Technology',
      publishedYear: 1994,
      tags: JSON.stringify(['programming', 'design-patterns', 'oop']),
      description:
        'Elements of Reusable Object-Oriented Software by the Gang of Four.',
      status: 'CHECKED_OUT',
      checkedOutByUserId: member.id,
      checkedOutAt: new Date(),
    },
    {
      id: 'book-005',
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      genre: 'Dystopian Fiction',
      publishedYear: 1949,
      tags: JSON.stringify(['classic', 'dystopian', 'politics']),
      description:
        'A dystopian novel set in a totalitarian society ruled by Big Brother.',
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { id: book.id },
      update: {},
      create: book as any,
    });
  }

  console.log('Seed completed:', {
    users: [admin.name, librarian.name, member.name],
    books: books.map((b) => b.title),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
