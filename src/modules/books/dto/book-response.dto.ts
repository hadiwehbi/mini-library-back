import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from '../../../common/dto/pagination.dto';

export class BookResponseDto {
  @ApiProperty({
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Book title',
    example: 'The Pragmatic Programmer',
  })
  title: string;

  @ApiProperty({
    description: 'Book author(s)',
    example: 'David Thomas, Andrew Hunt',
  })
  author: string;

  @ApiProperty({
    description: 'Book availability status',
    example: 'AVAILABLE',
    enum: ['AVAILABLE', 'CHECKED_OUT'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'ISBN-13 identifier',
    example: '978-0135957059',
  })
  isbn?: string | null;

  @ApiPropertyOptional({
    description: 'Book genre / category',
    example: 'Technology',
  })
  genre?: string | null;

  @ApiPropertyOptional({
    description: 'Year the book was published',
    example: 2019,
  })
  publishedYear?: number | null;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['programming', 'software-engineering'],
    type: [String],
  })
  tags?: string[] | null;

  @ApiPropertyOptional({
    description: 'Book description',
    example: 'A classic guide to software development best practices.',
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'URL of the book cover image',
    example: 'https://example.com/covers/pragmatic-programmer.jpg',
  })
  coverImageUrl?: string | null;

  @ApiPropertyOptional({
    description: 'ID of the user who checked out the book',
    example: 'member-001',
  })
  checkedOutByUserId?: string | null;

  @ApiPropertyOptional({
    description: 'When the book was checked out',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedOutAt?: Date | null;

  @ApiProperty({
    description: 'When the book record was created',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the book record was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedBooksResponseDto {
  @ApiProperty({ type: [BookResponseDto] })
  data: BookResponseDto[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
