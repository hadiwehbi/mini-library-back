import { ApiProperty } from '@nestjs/swagger';

export class DevLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDEiLCJlbWFpbCI6ImFkbWluQGxpYnJhcnkubG9jYWwiLCJuYW1lIjoiQWRtaW4gVXNlciIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.placeholder',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 86400,
  })
  expiresIn: number;
}

export class MeResponseDto {
  @ApiProperty({ description: 'User ID (IdP sub)', example: 'admin-001' })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@library.local',
  })
  email: string;

  @ApiProperty({ description: 'User display name', example: 'Admin User' })
  name: string;

  @ApiProperty({
    description: 'User role',
    example: 'ADMIN',
    enum: ['ADMIN', 'LIBRARIAN', 'MEMBER'],
  })
  role: string;
}
