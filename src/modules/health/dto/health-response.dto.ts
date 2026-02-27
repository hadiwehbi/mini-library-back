import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Application health status',
    example: 'ok',
    enum: ['ok', 'degraded', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 3600,
  })
  uptime: number;
}
