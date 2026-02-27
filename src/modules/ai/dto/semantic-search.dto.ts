import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SemanticSearchRequestDto {
  @ApiProperty({
    description: 'Natural language search query',
    example: 'books about clean software architecture',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 5,
    default: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

export class SemanticSearchResultDto {
  @ApiProperty({
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Book title',
    example: 'Clean Code',
  })
  title: string;

  @ApiProperty({
    description: 'Book author',
    example: 'Robert C. Martin',
  })
  author: string;

  @ApiProperty({
    description: 'Relevance score (0.0 to 1.0)',
    example: 0.92,
  })
  score: number;

  @ApiProperty({
    description: 'Why this book was matched',
    example: 'Matches query about clean software - focuses on writing clean, maintainable code.',
  })
  reason: string;
}

export class SemanticSearchResponseDto {
  @ApiProperty({
    type: [SemanticSearchResultDto],
    description: 'List of matching books ranked by relevance',
  })
  results: SemanticSearchResultDto[];

  @ApiProperty({
    description: 'Provider used for search',
    example: 'mock',
  })
  provider: string;
}
