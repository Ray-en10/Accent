import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT' | 'INSTALLER' | 'NETWORK_MANAGER';
  phone?: string;
  governorate?: string;
  city?: string;
  address?: string;
  meterType?: string;
  circuitCount?: number;
  subscribedPower?: string;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  login(email: string, password: string): Observable<User> { return this.http.post<User>('/api/auth/login', { email, password }); }
  createClient(name: string, email: string, password: string): Observable<User> { return this.http.post<User>('/api/auth/register', { name, email, password }); }
  resetPassword(email: string): Observable<void> { return this.http.post<void>('/api/auth/password/reset', { email }); }
  saveUser(user: User): void { localStorage.setItem('tricity-user', JSON.stringify(user)); }
  currentUser(): User | null {
    const value = localStorage.getItem('tricity-user');
    return value ? JSON.parse(value) as User : null;
  }
}
