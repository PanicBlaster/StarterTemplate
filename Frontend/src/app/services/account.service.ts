import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackendService } from './backend.service';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
}

export interface UserDetail {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private backend: BackendService, private http: HttpClient) {}

  getAccounts(tenantId: string): Observable<User[]> {
    return this.backend.get<User[]>('account');
  }

  getCurrentProfile(): Observable<UserProfile> {
    return this.backend.get<UserProfile>('profile');
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return this.backend.put<UserProfile>('profile', profile);
  }

  getAccount(id: string): Observable<UserDetail> {
    return this.backend.get<UserDetail>(`account/${id}`);
  }

  updateAccount(id: string, user: UserDetail): Observable<UserDetail> {
    return this.backend.put<UserDetail>(`account/${id}`, user);
  }

  getAllAccounts(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/account`);
  }

  addUserToTenant(tenantId: string, userId: string): Observable<any> {
    return this.backend.post(`account/tenant/add-user`, { tenantId, userId });
  }
}
