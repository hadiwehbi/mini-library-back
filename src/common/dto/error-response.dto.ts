import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetail {
  @ApiProperty({
    description: 'Machine-readable error code',
    example: 'VALIDATION_ERROR',
    enum: [
      'VALIDATION_ERROR',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'INTERNAL_ERROR',
    ],
  })
  code: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'The requested resource was not found',
  })
  message: string;

  @ApiProperty({
    description: 'Additional error details',
    example: { field: 'title', issue: 'must not be empty' },
    required: false,
  })
  details?: Record<string, unknown>;
}

export class ErrorResponseDto {
  @ApiProperty({ type: ErrorDetail })
  error: ErrorDetail;
}
