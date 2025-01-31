import { ApiProperty } from '@nestjs/swagger';

export interface JwtPayload {
  userId: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
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
    },
  })
  user: any;
}
