import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackendService } from './backend.service';
import { UserDto } from '../dto/user.dto';
import { ProcessResult, QueryResult } from '../dto/query.dto';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private backend: BackendService, private http: HttpClient) {}

  getCurrentProfile(): Observable<UserDto> {
    return this.backend.get<UserDto>('profile');
  }

  updateProfile(profile: UserDto): Observable<ProcessResult> {
    return this.backend.put<ProcessResult>('profile', profile);
  }

  getAccount(id: string): Observable<UserDto> {
    return this.backend.get<UserDto>(`account/${id}`);
  }

  updateAccount(id: string, user: UserDto): Observable<ProcessResult> {
    return this.backend.put<ProcessResult>(`account/${id}`, user);
  }

  getAccounts(tenantId?: string): Observable<QueryResult<UserDto>> {
    return this.backend.get<UserDto[]>('account');
  }

  addUserToTenant(tenantId: string, userId: string): Observable<any> {
    return this.backend.post(`account/tenant/add-user`, { tenantId, userId });
  }
}
