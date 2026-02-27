import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthResponseDto } from './dto/health-response.dto';
import { ConfigService } from '../../config/config.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns the current health status, API version, and uptime. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      version: this.config.apiVersion,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
