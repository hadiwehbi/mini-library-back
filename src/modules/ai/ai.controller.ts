import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  SuggestMetadataRequestDto,
  SuggestMetadataResponseDto,
} from './dto/suggest-metadata.dto';
import {
  SemanticSearchRequestDto,
  SemanticSearchResponseDto,
} from './dto/semantic-search.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('AI')
@ApiBearerAuth('bearer')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-metadata')
  @ApiOperation({
    summary: 'AI-powered metadata suggestions',
    description: `Analyzes a book title (and optionally author) and returns AI-generated suggestions for genre, tags, and description. Uses mock provider by default; set \`AI_PROVIDER\` and \`OPENAI_API_KEY\` env vars for real LLM integration.

Returns a confidence score indicating how certain the AI is about the suggestions.`,
  })
  @ApiBody({
    type: SuggestMetadataRequestDto,
    examples: {
      techBook: {
        summary: 'Technology book',
        value: {
          title: 'The Pragmatic Programmer',
          author: 'David Thomas, Andrew Hunt',
        },
      },
      fictionBook: {
        summary: 'Fiction book',
        value: {
          title: 'Dune',
          author: 'Frank Herbert',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Metadata suggestions generated successfully',
    type: SuggestMetadataResponseDto,
  })
  @ApiErrorResponses(400, 401, 500)
  async suggestMetadata(
    @Body() dto: SuggestMetadataRequestDto,
  ): Promise<SuggestMetadataResponseDto> {
    return this.aiService.suggestMetadata(dto);
  }

  @Post('semantic-search')
  @ApiOperation({
    summary: 'AI-powered semantic book search',
    description: `Search the library using natural language queries. The AI analyzes the query semantics and matches against book metadata, returning results ranked by relevance score.

Uses mock keyword-matching by default; configure \`AI_PROVIDER=openai\` for real semantic search.`,
  })
  @ApiBody({
    type: SemanticSearchRequestDto,
    examples: {
      techQuery: {
        summary: 'Search for coding books',
        value: {
          query: 'books about clean software architecture',
          limit: 5,
        },
      },
      fictionQuery: {
        summary: 'Search for sci-fi',
        value: {
          query: 'science fiction desert planet',
          limit: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Semantic search results',
    type: SemanticSearchResponseDto,
  })
  @ApiErrorResponses(400, 401, 500)
  async semanticSearch(
    @Body() dto: SemanticSearchRequestDto,
  ): Promise<SemanticSearchResponseDto> {
    return this.aiService.semanticSearch(dto);
  }
}
