import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface User { id: number; name: string; email: string; role: 'ADMIN' | 'CLIENT' | 'INSTALLER'; }
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  login(email: string, password: string): Observable<User> { return this.http.post<User>('/api/auth/login', { email, password }); }
  createClient(name: string, email: string, password: string): Observable<User> { return this.http.post<User>('/api/auth/register', { name, email, password }); }
}
