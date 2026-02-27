import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  LIBRARIAN = 'LIBRARIAN',
  MEMBER = 'MEMBER',
}

export class DevLoginDto {
  @ApiProperty({
    description: 'User subject identifier (simulates IdP sub)',
    example: 'admin-001',
  })
  @IsString()
  @IsNotEmpty()
  sub: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@library.local',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'Admin User',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User role for RBAC',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
