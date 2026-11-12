import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface NewAccount { name: string; email: string; role: 'CLIENT' | 'INSTALLER' | 'ADMIN'; password: string; }
export interface Account { id: number; name: string; email: string; role: 'CLIENT' | 'INSTALLER' | 'ADMIN'; }
export interface Dashboard { totalConsumption: number; activeSites: number; alerts: number; chart: number[]; recentAccounts: { name: string; email: string; role: string; createdAt: string }[]; }
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  dashboard(): Observable<Dashboard> { return this.http.get<Dashboard>('/api/admin/dashboard'); }
  createAccount(account: NewAccount): Observable<void> { return this.http.post<void>('/api/admin/accounts', account); }
  listAccounts(): Observable<Account[]> { return this.http.get<Account[]>('/api/admin/accounts'); }
  getAccount(id: number): Observable<Account> { return this.http.get<Account>(`/api/admin/accounts/${id}`); }
  updateAccount(id: number, account: NewAccount): Observable<Account> { return this.http.put<Account>(`/api/admin/accounts/${id}`, account); }
  deleteAccount(id: number): Observable<void> { return this.http.delete<void>(`/api/admin/accounts/${id}`); }
}
