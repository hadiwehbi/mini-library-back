import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SuggestMetadataRequestDto {
  @ApiProperty({
    description: 'Book title to analyze',
    example: 'The Pragmatic Programmer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Book author (helps improve suggestions)',
    example: 'David Thomas, Andrew Hunt',
  })
  @IsOptional()
  @IsString()
  author?: string;
}

export class SuggestMetadataResponseDto {
  @ApiProperty({
    description: 'Suggested genre for the book',
    example: 'Technology / Software Engineering',
  })
  genre: string;

  @ApiProperty({
    description: 'Suggested tags',
    example: ['programming', 'software-engineering', 'best-practices'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'AI-generated description',
    example:
      'A comprehensive guide to software development best practices, covering topics from coding techniques to career development for programmers.',
  })
  description: string;

  @ApiProperty({
    description: 'Confidence score (0.0 to 1.0)',
    example: 0.85,
  })
  confidence: number;

  @ApiProperty({
    description: 'Provider used for suggestions (mock or openai)',
    example: 'mock',
  })
  provider: string;
}
