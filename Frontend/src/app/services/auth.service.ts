import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse, TenantInfo } from './auth.interface';
import { BackendService } from './backend.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface Profile {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
}

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

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/account/login`, {
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

  private setSession(response: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_ID_KEY, response.user.id);
    localStorage.setItem(this.USERNAME_KEY, response.user.username);
    localStorage.setItem(this.FIRST_NAME_KEY, response.user.first_name);
    localStorage.setItem(this.LAST_NAME_KEY, response.user.last_name);
    localStorage.setItem(this.EMAIL_KEY, response.user.email);
    localStorage.setItem(this.PHONE_KEY, response.user.phone);
    localStorage.setItem(this.ROLE_KEY, response.user.role);

    localStorage.setItem(this.AVATAR_URL_KEY, this.getAvatarUrl());
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
    const phone = localStorage.getItem(this.PHONE_KEY);

    return { firstName, lastName, username, email, phone };
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
  }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/account/signup`, credentials);
  }

  getUserId(): string {
    return localStorage.getItem(this.USER_ID_KEY) || '';
  }

  handleUnauthorized() {
    this.logout(); // This will also set isAuthenticated to false
  }
}
