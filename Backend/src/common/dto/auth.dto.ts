import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUUID,
} from 'class-validator';

export interface JwtPayload {
  userId: string;
  username: string;
}

interface TenantInfo {
  id: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    tenants: TenantInfo[];
  };
}

export class AuthResponseDto implements AuthResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      username: { type: 'string' },
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      role: { type: 'string' },
      tenants: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  user: any;
}

export class SigninDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignupDto {
  @ApiProperty({ example: 'john.doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Tenant name to join' })
  @IsString()
  @IsOptional()
  tenantName?: string;

  @ApiPropertyOptional({ description: 'Tenant ID to join' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}

export class MSSignInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class SignInWithCodeDto {
  @ApiProperty({ description: 'Authorization code from Cognito OAuth flow' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Redirect URI used in the OAuth flow' })
  @IsString()
  @IsNotEmpty()
  redirectUri: string;
}
