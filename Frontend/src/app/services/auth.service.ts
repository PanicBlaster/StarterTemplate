import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, Profile, TenantInfo } from '../dto/auth.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'username';
  private readonly USER_ID_KEY = 'user_id';
  private readonly FIRST_NAME_KEY = 'first_name';
  private readonly LAST_NAME_KEY = 'last_name';
  private readonly EMAIL_KEY = 'email';
  private readonly PHONE_KEY = 'phone';
  private readonly ROLE_KEY = 'role';
  private readonly AVATAR_URL_KEY = 'avatar_url';
  private readonly TENANTS_KEY = 'tenants';
  private readonly TENANT_ID_KEY = 'tenant_id';
  private readonly TENANT_NAME_KEY = 'tenant_name';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    // Initialize authentication state
    this.isAuthenticatedSubject.next(this.hasValidToken());
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  signin(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/signin`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          this.setSession(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  private setSession(response: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_ID_KEY, response.user.id);
    localStorage.setItem(this.USERNAME_KEY, response.user.username);
    localStorage.setItem(this.FIRST_NAME_KEY, response.user.firstName);
    localStorage.setItem(this.LAST_NAME_KEY, response.user.lastName);
    localStorage.setItem(this.EMAIL_KEY, response.user.email);
    localStorage.setItem(this.ROLE_KEY, response.user.role);

    localStorage.setItem(this.AVATAR_URL_KEY, this.getAvatarUrl());

    localStorage.setItem(
      this.TENANTS_KEY,
      JSON.stringify(response.user.tenants)
    );

    if (response.user.tenants.length > 0) {
      localStorage.setItem(this.TENANT_ID_KEY, response.user.tenants[0].id);
      localStorage.setItem(this.TENANT_NAME_KEY, response.user.tenants[0].name);
    }
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.FIRST_NAME_KEY);
    localStorage.removeItem(this.LAST_NAME_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.PHONE_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.AVATAR_URL_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentProfile(): Profile | null {
    const firstName = localStorage.getItem(this.FIRST_NAME_KEY);
    const lastName = localStorage.getItem(this.LAST_NAME_KEY);
    const username = localStorage.getItem(this.USERNAME_KEY);
    const email = localStorage.getItem(this.EMAIL_KEY);

    return { firstName, lastName, username, email };
  }

  getUserInitials(): string {
    const firstName = localStorage.getItem(this.FIRST_NAME_KEY) || '';
    const lastName = localStorage.getItem(this.LAST_NAME_KEY) || '';

    if (!firstName && !lastName) {
      return '??';
    }

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getAvatarUrl(): string {
    const firstName = localStorage.getItem(this.FIRST_NAME_KEY) || '';
    const lastName = localStorage.getItem(this.LAST_NAME_KEY) || '';
    const name = `${firstName}+${lastName}`;
    return `https://ui-avatars.com/api/?name=${name}`;
  }

  signup(credentials: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    tenantName: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/signup`, credentials)
      .pipe(
        tap((response) => {
          this.setSession(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  selectTenant(tenant: TenantInfo) {
    localStorage.setItem(this.TENANT_ID_KEY, tenant.id);
    localStorage.setItem(this.TENANT_NAME_KEY, tenant.name);
  }

  getCurrentTenant(): TenantInfo | null {
    const id = localStorage.getItem(this.TENANT_ID_KEY);
    const name = localStorage.getItem(this.TENANT_NAME_KEY);
    return id && name ? { id, name } : null;
  }

  getUserId(): string {
    return localStorage.getItem(this.USER_ID_KEY) || '';
  }

  handleUnauthorized() {
    this.logout(); // This will also set isAuthenticated to false
  }
}
