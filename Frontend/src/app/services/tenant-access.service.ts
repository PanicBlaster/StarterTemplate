import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProcessResult, QueryOptions, QueryResult } from '../dto/query.dto';
import { TenantInfo } from '../dto/auth.dto';
import { BackendService } from './backend.service';
import { TenantDto, CreateTenantDto } from '../dto/tenant.dto';

@Injectable({
  providedIn: 'root',
})
export class TenantAccessService {
  constructor(private backend: BackendService, private http: HttpClient) {}

  getTenants(params: QueryOptions): Observable<QueryResult<TenantDto>> {
    const queryParams: any = {
      skip: params.skip || 0,
      take: params.take || 10,
    };

    if (params.userId) {
      queryParams.user = params.userId;
    }

    let userParams = '';
    if (params.userId) {
      userParams = `&user=${params.userId}`;
    }
    let allParams = '';
    if (params.all) {
      allParams = `&all=${params.all}`;
    }

    let filterParams = '';
    if (params.filter) {
      filterParams = `&filter=${params.filter}`;
    }

    return this.backend.get<QueryResult<TenantDto>>(
      `tenant?take=${params.take}&skip=${params.skip}${userParams}${allParams}${filterParams}`
    );
  }

  addTenantAccess(tenantId: string, userId: string): Observable<any> {
    return this.backend.post(`tenant/${tenantId}/user/${userId}`, {
      tenantId,
      userId,
    });
  }

  removeTenantAccess(tenantId: string, userId: string): Observable<any> {
    return this.backend.delete(`tenant/${tenantId}/user/${userId}`);
  }

  deleteTenant(tenantId: string): Observable<any> {
    return this.backend.delete(`tenant/${tenantId}`);
  }

  getTenant(id: string): Observable<TenantDto> {
    if (id === 'new') {
      return of({
        id: 'new',
        name: '',
        description: '',
      });
    }
    return this.backend.get<TenantDto>(`tenant/${id}`);
  }

  createTenant(tenant: CreateTenantDto): Observable<ProcessResult> {
    return this.backend.post<ProcessResult>('tenant', tenant);
  }

  updateTenant(id: string, tenant: TenantDto): Observable<ProcessResult> {
    return this.backend.put<ProcessResult>(`tenant/${id}`, tenant);
  }
}
