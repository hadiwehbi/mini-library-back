import { Controller, Post, Get, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DevLoginDto } from './dto/dev-login.dto';
import { DevLoginResponseDto, MeResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/dev-login')
  @Public()
  @ApiOperation({
    summary: 'Dev login (development only)',
    description: `Generate a JWT token for development and testing purposes.
This endpoint is only available when \`DEV_AUTH_ENABLED=true\` in the environment.
**NEVER enable this in production.**

### Quick Start
1. Call this endpoint with a user profile
2. Copy the \`accessToken\` from the response
3. Click **Authorize** in Swagger UI and enter \`Bearer <token>\`
4. You can now access protected endpoints`,
  })
  @ApiBody({
    type: DevLoginDto,
    examples: {
      admin: {
        summary: 'Login as Admin',
        value: {
          sub: 'admin-001',
          email: 'admin@library.local',
          name: 'Admin User',
          role: 'ADMIN',
        },
      },
      librarian: {
        summary: 'Login as Librarian',
        value: {
          sub: 'librarian-001',
          email: 'librarian@library.local',
          name: 'Jane Librarian',
          role: 'LIBRARIAN',
        },
      },
      member: {
        summary: 'Login as Member',
        value: {
          sub: 'member-001',
          email: 'member@library.local',
          name: 'John Member',
          role: 'MEMBER',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully generated dev JWT token',
    type: DevLoginResponseDto,
  })
  @ApiErrorResponses(400, 403)
  async devLogin(@Body() dto: DevLoginDto): Promise<DevLoginResponseDto> {
    return this.authService.devLogin(dto);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the authenticated user profile including ID, email, name, and role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: MeResponseDto,
  })
  @ApiErrorResponses(401)
  async getMe(@CurrentUser() user: AuthUser): Promise<MeResponseDto> {
    return this.authService.getMe(user.sub);
  }
}
