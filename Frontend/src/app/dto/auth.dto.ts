export interface TenantInfo {
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

export interface Profile {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
}
