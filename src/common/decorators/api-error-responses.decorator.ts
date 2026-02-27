import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

export function ApiErrorResponses(
  ...codes: (400 | 401 | 403 | 404 | 409 | 500)[]
) {
  const decorators: MethodDecorator[] = [];

  const descriptions: Record<number, string> = {
    400: 'Validation error - invalid request parameters or body',
    401: 'Unauthorized - missing or invalid authentication token',
    403: 'Forbidden - insufficient permissions for this operation',
    404: 'Not found - the requested resource does not exist',
    409: 'Conflict - operation conflicts with current resource state',
    500: 'Internal server error - unexpected error occurred',
  };

  for (const code of codes) {
    decorators.push(
      ApiResponse({
        status: code,
        description: descriptions[code],
        type: ErrorResponseDto,
      }),
    );
  }

  return applyDecorators(...decorators);
}
