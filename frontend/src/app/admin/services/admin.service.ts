import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface NewAccount { name: string; email: string; role: 'CLIENT' | 'INSTALLER' | 'ADMIN' | 'NETWORK_MANAGER'; status?: 'ACTIVE' | 'INACTIVE'; phone?: string; governorate?: string; city?: string; address?: string; meterType?: string; circuitCount?: number; subscribedPower?: string; }
export interface Account { id: number; name: string; email: string; role: 'CLIENT' | 'INSTALLER' | 'ADMIN' | 'NETWORK_MANAGER'; status: 'ACTIVE' | 'INACTIVE'; phone?: string; governorate?: string; city?: string; address?: string; meterType?: string; circuitCount?: number; subscribedPower?: string; }
export interface Dashboard { totalConsumption: number; activeSites: number; alerts: number; chart: number[]; recentAccounts: { name: string; email: string; role: string; createdAt: string }[]; }
export interface ConsumptionPlace { name: string; consumption: number; status: string; updatedAt: string; }
export interface ConsumptionRegion { id: string; name: string; consumption: number; sites: number; change: number; places: ConsumptionPlace[]; }
export interface CustomerRequest { id: number; name: string; phone: string; email: string; governorate: string; city: string; address: string; customerType: string; meter: string; payment: string; notes: string; soloQuantity: number; duoQuantity: number; status: 'PENDING' | 'CONFIRMED' | 'REJECTED'; createdAt: string; }
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  dashboard(): Observable<Dashboard> { return this.http.get<Dashboard>('/api/admin/dashboard'); }
  createAccount(account: NewAccount): Observable<Account> { return this.http.post<Account>('/api/admin/accounts', account); }
  listAccounts(): Observable<Account[]> { return this.http.get<Account[]>('/api/admin/accounts'); }
  getAccount(id: number): Observable<Account> { return this.http.get<Account>(`/api/admin/accounts/${id}`); }
  updateAccount(id: number, account: NewAccount): Observable<Account> { return this.http.put<Account>(`/api/admin/accounts/${id}`, account); }
  deleteAccount(id: number): Observable<void> { return this.http.delete<void>(`/api/admin/accounts/${id}`); }
  regions(): Observable<ConsumptionRegion[]> { return this.http.get<ConsumptionRegion[]>('/api/admin/consumption/regions'); }
  region(id: string): Observable<ConsumptionRegion> { return this.http.get<ConsumptionRegion>(`/api/admin/consumption/regions/${id}`); }
  requests(): Observable<CustomerRequest[]> { return this.http.get<CustomerRequest[]>('/api/admin/requests'); }
  updateRequestStatus(id: number, status: CustomerRequest['status']): Observable<CustomerRequest> { return this.http.patch<CustomerRequest>(`/api/admin/requests/${id}/status?status=${status}`, {}); }
}
