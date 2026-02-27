import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Book title',
    example: 'The Pragmatic Programmer',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Book author(s)',
    example: 'David Thomas, Andrew Hunt',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({
    description: 'ISBN-13 identifier',
    example: '978-0135957059',
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({
    description: 'Book genre / category',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Year the book was published',
    example: 2019,
    minimum: 0,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2100)
  publishedYear?: number;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['programming', 'software-engineering'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Book description or summary',
    example: 'A classic guide to software development best practices.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL of the book cover image',
    example: 'https://example.com/covers/pragmatic-programmer.jpg',
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;
}
