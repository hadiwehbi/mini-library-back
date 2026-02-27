import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum BookStatus {
  AVAILABLE = 'AVAILABLE',
  CHECKED_OUT = 'CHECKED_OUT',
}

export class BookQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Search query - searches across title, author, genre, isbn, description, and tags',
    example: 'pragmatic',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @ApiPropertyOptional({
    description: 'Filter by genre',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Filter by author (partial match)',
    example: 'Martin',
  })
  @IsOptional()
  @IsString()
  author?: string;
}
