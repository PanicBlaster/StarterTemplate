import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const currentTenant = this.authService.getCurrentTenant();
    if (currentTenant) {
      headers = headers.set('X-Tenant-ID', currentTenant.id);
    }
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handle401Error = (error: any) => {
    if (error.status === 401) {
      this.authService.handleUnauthorized();
    }
    throw error;
  };

  get<T>(
    path: string,
    params?: HttpParams,
    options: any = {}
  ): Observable<any> {
    return this.http
      .get<T>(`${this.baseUrl}/${path}`, {
        headers: this.getHeaders(),
        params,
        ...options,
      })
      .pipe(catchError(this.handle401Error));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${path}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handle401Error));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${path}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handle401Error));
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${path}`, body, {
      headers: this.getHeaders(),
    });
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${path}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handle401Error));
  }

  getText(path: string, params?: HttpParams): Observable<string> {
    return this.http
      .get(`${this.baseUrl}/${path}`, {
        headers: this.getHeaders(),
        params,
        responseType: 'text',
      })
      .pipe(catchError(this.handle401Error));
  }
}
