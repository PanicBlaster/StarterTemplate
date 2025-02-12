import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QueryOptions, QueryResult } from '../dto/query.dto';
import { TenantInfo } from '../dto/auth.dto';
import { BackendService } from './backend.service';

@Injectable({
  providedIn: 'root',
})
export class TenantAccessService {
  constructor(private backend: BackendService) {}

  getTenants(params: QueryOptions): Observable<QueryResult<TenantInfo>> {
    const queryParams: any = {
      skip: params.skip || 0,
      take: params.take || 10,
    };

    if (params.userId) {
      queryParams.user = params.userId;
    }

    const userParams = `user=${params.userId}`;

    return this.backend.get<QueryResult<TenantInfo>>(
      `tenant?take=${params.take}&skip=${params.skip}&${userParams}`
    );
  }

  removeTenantAccess(tenantId: string, userId: string): Observable<any> {
    return this.backend.delete(`tenant/${tenantId}/users/${userId}`);
  }
}
