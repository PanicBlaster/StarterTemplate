export interface TenantInfo {
  id: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    tenants: TenantInfo[];
  };
}
