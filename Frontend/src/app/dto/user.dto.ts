import { TenantInfo } from './auth.dto';

export interface UserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  source: string;
  tenants: TenantInfo[];
  createdAt?: Date;
  updatedAt?: Date;
}
