import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';
import {
  BookResponseDto,
  PaginatedBooksResponseDto,
} from './dto/book-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Books')
@ApiBearerAuth('bearer')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({
    summary: 'List books with pagination, filtering, and search',
    description: `Returns a paginated list of books. Supports full-text search across title, author, genre, ISBN, description, and tags. Results can be filtered by status, genre, and author, and sorted by various fields.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of books',
    type: PaginatedBooksResponseDto,
  })
  @ApiErrorResponses(401)
  async findAll(@Query() query: BookQueryDto): Promise<PaginatedBooksResponseDto> {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a book by ID',
    description: 'Returns a single book by its UUID, including all metadata and checkout status.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'The book details',
    type: BookResponseDto,
  })
  @ApiErrorResponses(401, 404)
  async findOne(@Param('id') id: string): Promise<BookResponseDto> {
    return this.booksService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiOperation({
    summary: 'Create a new book',
    description:
      'Creates a new book in the library catalog. Requires ADMIN or LIBRARIAN role. The book will be set to AVAILABLE status by default.',
  })
  @ApiBody({
    type: CreateBookDto,
    examples: {
      basic: {
        summary: 'Basic book creation',
        value: {
          title: 'The Pragmatic Programmer',
          author: 'David Thomas, Andrew Hunt',
        },
      },
      full: {
        summary: 'Full book creation',
        value: {
          title: 'Clean Code',
          author: 'Robert C. Martin',
          isbn: '978-0132350884',
          genre: 'Technology',
          publishedYear: 2008,
          tags: ['programming', 'clean-code'],
          description:
            'A handbook of agile software craftsmanship.',
          coverImageUrl: 'https://example.com/covers/clean-code.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully',
    type: BookResponseDto,
  })
  @ApiErrorResponses(400, 401, 403)
  async create(
    @Body() dto: CreateBookDto,
    @CurrentUser() user: AuthUser,
  ): Promise<BookResponseDto> {
    return this.booksService.create(dto, user.sub);
  }

  @Put(':id')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiOperation({
    summary: 'Update a book',
    description:
      'Updates an existing book. Only the provided fields will be changed. Requires ADMIN or LIBRARIAN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully',
    type: BookResponseDto,
  })
  @ApiErrorResponses(400, 401, 403, 404)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @CurrentUser() user: AuthUser,
  ): Promise<BookResponseDto> {
    return this.booksService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a book',
    description:
      'Permanently removes a book from the catalog. **ADMIN only.** This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Book deleted successfully',
  })
  @ApiErrorResponses(401, 403, 404)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.booksService.delete(id, user.sub);
  }

  @Post(':id/checkout')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiOperation({
    summary: 'Check out a book',
    description: `Marks a book as checked out by the current user. The book must be in AVAILABLE status.
Returns 409 Conflict if the book is already checked out.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Book checked out successfully',
    type: BookResponseDto,
  })
  @ApiErrorResponses(401, 403, 404, 409)
  async checkout(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<BookResponseDto> {
    return this.booksService.checkout(id, user.sub);
  }

  @Post(':id/checkin')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiOperation({
    summary: 'Check in a book',
    description: `Returns a checked-out book to available status.
Returns 409 Conflict if the book is not currently checked out.`,
  })
  @ApiParam({
    name: 'id',
    description: 'Book UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Book checked in successfully',
    type: BookResponseDto,
  })
  @ApiErrorResponses(401, 403, 404, 409)
  async checkin(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<BookResponseDto> {
    return this.booksService.checkin(id, user.sub);
  }
}
