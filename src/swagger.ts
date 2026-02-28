import { config } from './config';

export function buildOpenApiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Mini Library Management API',
      description: `## Overview
A production-ready REST API for managing a mini library system. Supports book CRUD operations, check-in/check-out workflows, AI-powered metadata suggestions, and role-based access control (RBAC).

## Authentication
This API supports two authentication modes:
- **OIDC/SSO**: Validate JWTs against an external identity provider (production)
- **Dev Auth**: Generate JWTs locally for development and testing

Use the \`POST /api/v1/auth/dev-login\` endpoint to obtain a token, then click **Authorize** above and enter \`Bearer <token>\`.

## Error Format
All errors follow a consistent format:
\`\`\`json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
\`\`\`

## Roles
- **ADMIN**: Full access including delete operations
- **LIBRARIAN**: Book management and check-in/check-out
- **MEMBER**: Read-only access to books and personal profile`,
      version: config.apiVersion,
      contact: {
        name: 'Library API Team',
        url: 'https://github.com/hadiwehbi/mini-library-back',
        email: 'support@library.local',
      },
      license: { name: 'ISC', url: 'https://opensource.org/licenses/ISC' },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication and authorization endpoints' },
      { name: 'Books', description: 'Book CRUD and check-in/check-out operations' },
      { name: 'AI', description: 'AI-powered library assistant endpoints' },
      { name: 'Health', description: 'Application health and readiness checks' },
    ],
    components: {
      securitySchemes: {
        bearer: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  enum: ['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'INTERNAL_ERROR'],
                  example: 'NOT_FOUND',
                },
                message: { type: 'string', example: 'The requested resource was not found' },
                details: { type: 'object', example: {} },
                requestId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
              },
              required: ['code', 'message'],
            },
          },
        },
        DevLoginRequest: {
          type: 'object',
          required: ['sub', 'email', 'name', 'role'],
          properties: {
            sub: { type: 'string', description: 'User subject identifier (simulates IdP sub)', example: 'admin-001' },
            email: { type: 'string', format: 'email', description: 'User email address', example: 'admin@library.local' },
            name: { type: 'string', description: 'User display name', example: 'Admin User' },
            role: { type: 'string', enum: ['ADMIN', 'LIBRARIAN', 'MEMBER'], description: 'User role for RBAC', example: 'ADMIN' },
          },
        },
        DevLoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIs...' },
            expiresIn: { type: 'number', description: 'Token expiration in seconds', example: 86400 },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'admin-001' },
            email: { type: 'string', example: 'admin@library.local' },
            name: { type: 'string', example: 'Admin User' },
            role: { type: 'string', enum: ['ADMIN', 'LIBRARIAN', 'MEMBER'], example: 'ADMIN' },
          },
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            title: { type: 'string', example: 'The Pragmatic Programmer' },
            author: { type: 'string', example: 'David Thomas, Andrew Hunt' },
            status: { type: 'string', enum: ['AVAILABLE', 'CHECKED_OUT'], example: 'AVAILABLE' },
            isbn: { type: 'string', nullable: true, example: '978-0135957059' },
            genre: { type: 'string', nullable: true, example: 'Technology' },
            publishedYear: { type: 'integer', nullable: true, example: 2019 },
            tags: { type: 'array', items: { type: 'string' }, nullable: true, example: ['programming', 'software-engineering'] },
            description: { type: 'string', nullable: true, example: 'A classic guide to software development best practices.' },
            coverImageUrl: { type: 'string', nullable: true, example: 'https://example.com/covers/pragmatic-programmer.jpg' },
            checkedOutByUserId: { type: 'string', nullable: true, example: null },
            checkedOutAt: { type: 'string', format: 'date-time', nullable: true, example: null },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
          },
        },
        CreateBookRequest: {
          type: 'object',
          required: ['title', 'author'],
          properties: {
            title: { type: 'string', minLength: 1, example: 'The Pragmatic Programmer' },
            author: { type: 'string', minLength: 1, example: 'David Thomas, Andrew Hunt' },
            isbn: { type: 'string', example: '978-0135957059' },
            genre: { type: 'string', example: 'Technology' },
            publishedYear: { type: 'integer', minimum: 0, maximum: 2100, example: 2019 },
            tags: { type: 'array', items: { type: 'string' }, example: ['programming', 'software-engineering'] },
            description: { type: 'string', example: 'A classic guide to software development best practices.' },
            coverImageUrl: { type: 'string', format: 'uri', example: 'https://example.com/covers/pragmatic-programmer.jpg' },
          },
        },
        UpdateBookRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1 },
            author: { type: 'string', minLength: 1 },
            isbn: { type: 'string' },
            genre: { type: 'string' },
            publishedYear: { type: 'integer', minimum: 0, maximum: 2100 },
            tags: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            coverImageUrl: { type: 'string', format: 'uri' },
          },
        },
        PaginatedBooks: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 42 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                totalPages: { type: 'integer', example: 3 },
                hasNext: { type: 'boolean', example: true },
                hasPrevious: { type: 'boolean', example: false },
              },
            },
          },
        },
        SuggestMetadataRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, description: 'Book title to analyze', example: 'The Pragmatic Programmer' },
            author: { type: 'string', description: 'Book author (helps improve suggestions)', example: 'David Thomas, Andrew Hunt' },
          },
        },
        SuggestMetadataResponse: {
          type: 'object',
          properties: {
            genre: { type: 'string', example: 'Technology / Software Engineering' },
            tags: { type: 'array', items: { type: 'string' }, example: ['programming', 'software-engineering', 'technology'] },
            description: { type: 'string', example: 'A technical book covering software development concepts.' },
            confidence: { type: 'number', example: 0.85 },
            provider: { type: 'string', example: 'mock' },
          },
        },
        SemanticSearchRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', minLength: 1, description: 'Natural language search query', example: 'books about clean software architecture' },
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 5, example: 5 },
          },
        },
        SemanticSearchResponse: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                  title: { type: 'string', example: 'Clean Code' },
                  author: { type: 'string', example: 'Robert C. Martin' },
                  score: { type: 'number', example: 0.92 },
                  reason: { type: 'string', example: 'Matched 3 of 4 query terms in book metadata.' },
                },
              },
            },
            provider: { type: 'string', example: 'mock' },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok', 'degraded', 'error'], example: 'ok' },
            version: { type: 'string', example: '1.0.0' },
            timestamp: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            uptime: { type: 'number', description: 'Uptime in seconds', example: 3600 },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Returns the current health status, API version, and uptime. This endpoint is public and does not require authentication.',
          operationId: 'getHealth',
          responses: {
            '200': {
              description: 'Application is healthy',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } },
            },
          },
        },
      },
      '/auth/dev-login': {
        post: {
          tags: ['Auth'],
          summary: 'Dev login (development only)',
          description: 'Generate a JWT token for development and testing purposes.\nThis endpoint is only available when `DEV_AUTH_ENABLED=true`.\n**NEVER enable this in production.**\n\n### Quick Start\n1. Call this endpoint with a user profile\n2. Copy the `accessToken` from the response\n3. Click **Authorize** in Swagger UI and enter `Bearer <token>`\n4. You can now access protected endpoints',
          operationId: 'devLogin',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DevLoginRequest' },
                examples: {
                  admin: { summary: 'Login as Admin', value: { sub: 'admin-001', email: 'admin@library.local', name: 'Admin User', role: 'ADMIN' } },
                  librarian: { summary: 'Login as Librarian', value: { sub: 'librarian-001', email: 'librarian@library.local', name: 'Jane Librarian', role: 'LIBRARIAN' } },
                  member: { summary: 'Login as Member', value: { sub: 'member-001', email: 'member@library.local', name: 'John Member', role: 'MEMBER' } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Successfully generated dev JWT token', content: { 'application/json': { schema: { $ref: '#/components/schemas/DevLoginResponse' } } } },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Dev auth is not enabled', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          description: 'Returns the authenticated user profile including ID, email, name, and role.',
          operationId: 'getMe',
          security: [{ bearer: [] }],
          responses: {
            '200': { description: 'Current user profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserProfile' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/books': {
        get: {
          tags: ['Books'],
          summary: 'List books with pagination, filtering, and search',
          description: 'Returns a paginated list of books. Supports full-text search across title, author, genre, ISBN, description, and tags.',
          operationId: 'listBooks',
          security: [{ bearer: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 }, description: 'Page number (1-indexed)' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }, description: 'Items per page' },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['title', 'author', 'createdAt', 'updatedAt', 'publishedYear', 'status'], default: 'createdAt' }, description: 'Sort field' },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort order' },
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query across title, author, genre, ISBN, description, tags', example: 'pragmatic' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['AVAILABLE', 'CHECKED_OUT'] }, description: 'Filter by status' },
            { name: 'genre', in: 'query', schema: { type: 'string' }, description: 'Filter by genre' },
            { name: 'author', in: 'query', schema: { type: 'string' }, description: 'Filter by author (partial match)' },
          ],
          responses: {
            '200': { description: 'Paginated list of books', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedBooks' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        post: {
          tags: ['Books'],
          summary: 'Create a new book',
          description: 'Creates a new book in the library catalog. Requires ADMIN or LIBRARIAN role.',
          operationId: 'createBook',
          security: [{ bearer: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateBookRequest' },
                examples: {
                  basic: { summary: 'Basic book', value: { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt' } },
                  full: { summary: 'Full book', value: { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', genre: 'Technology', publishedYear: 2008, tags: ['programming', 'clean-code'], description: 'A handbook of agile software craftsmanship.', coverImageUrl: 'https://example.com/covers/clean-code.jpg' } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Book created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/books/{id}': {
        get: {
          tags: ['Books'],
          summary: 'Get a book by ID',
          description: 'Returns a single book by its UUID.',
          operationId: 'getBook',
          security: [{ bearer: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Book UUID' }],
          responses: {
            '200': { description: 'Book details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Books'],
          summary: 'Update a book',
          description: 'Updates an existing book. Only provided fields are changed. Requires ADMIN or LIBRARIAN role.',
          operationId: 'updateBook',
          security: [{ bearer: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Book UUID' }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBookRequest' } } },
          },
          responses: {
            '200': { description: 'Book updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Books'],
          summary: 'Delete a book',
          description: 'Permanently removes a book from the catalog. **ADMIN only.**',
          operationId: 'deleteBook',
          security: [{ bearer: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Book UUID' }],
          responses: {
            '204': { description: 'Book deleted' },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/books/{id}/checkout': {
        post: {
          tags: ['Books'],
          summary: 'Check out a book',
          description: 'Marks a book as checked out. The book must be AVAILABLE. Returns 409 if already checked out.',
          operationId: 'checkoutBook',
          security: [{ bearer: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Book UUID' }],
          responses: {
            '201': { description: 'Book checked out', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '409': { description: 'Already checked out', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/books/{id}/checkin': {
        post: {
          tags: ['Books'],
          summary: 'Check in a book',
          description: 'Returns a checked-out book to available status. Returns 409 if not checked out.',
          operationId: 'checkinBook',
          security: [{ bearer: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Book UUID' }],
          responses: {
            '201': { description: 'Book checked in', content: { 'application/json': { schema: { $ref: '#/components/schemas/Book' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '409': { description: 'Not checked out', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/ai/suggest-metadata': {
        post: {
          tags: ['AI'],
          summary: 'AI-powered metadata suggestions',
          description: 'Analyzes a book title (and optionally author) and returns AI-generated suggestions for genre, tags, and description. Uses mock provider by default.',
          operationId: 'suggestMetadata',
          security: [{ bearer: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuggestMetadataRequest' },
                examples: {
                  techBook: { summary: 'Technology book', value: { title: 'The Pragmatic Programmer', author: 'David Thomas, Andrew Hunt' } },
                  fictionBook: { summary: 'Fiction book', value: { title: 'Dune', author: 'Frank Herbert' } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Metadata suggestions generated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuggestMetadataResponse' } } } },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/ai/semantic-search': {
        post: {
          tags: ['AI'],
          summary: 'AI-powered semantic book search',
          description: 'Search the library using natural language queries. Returns results ranked by relevance. Uses mock keyword-matching by default.',
          operationId: 'semanticSearch',
          security: [{ bearer: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SemanticSearchRequest' },
                examples: {
                  techQuery: { summary: 'Search for coding books', value: { query: 'books about clean software architecture', limit: 5 } },
                  fictionQuery: { summary: 'Search for sci-fi', value: { query: 'science fiction desert planet', limit: 3 } },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Search results', content: { 'application/json': { schema: { $ref: '#/components/schemas/SemanticSearchResponse' } } } },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
  };
}
