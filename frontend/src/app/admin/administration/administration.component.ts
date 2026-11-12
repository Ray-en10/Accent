import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account, AdminService, NewAccount } from '../services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">BACK-OFFICE</p><h1>Administration</h1></div><button class="btn lime" (click)="showForm=true">+ Créer un compte</button></header>
    <section class="card admin-card"><div class="section-title"><div><p class="eyebrow">ACCÈS UTILISATEURS</p><h2>Clients et installateurs</h2></div><span class="count">{{accounts.length}} comptes</span></div>
      <table><thead><tr><th>COMPTE</th><th>RÔLE</th><th>STATUT</th></tr></thead><tbody>@for (account of accounts; track account.id) {<tr><td><b>{{account.name}}</b><small>{{account.email}}</small></td><td>{{roleLabel(account.role)}}</td><td><span class="status">● Actif</span></td></tr>}</tbody></table>
    </section>
    @if (showForm) {<div class="modal-backdrop" (click)="showForm=false"><div class="modal card" (click)="$event.stopPropagation()"><button class="close" type="button" (click)="showForm=false">×</button><p class="eyebrow">NOUVEAU COMPTE</p><h2>Créer un accès</h2><p class="hint">Créez un compte client ou installateur depuis le back-office.</p><form (ngSubmit)="createAccount()"><label>Nom complet<input name="accountName" [(ngModel)]="form.name" required></label><label>Email professionnel<input name="accountEmail" type="email" [(ngModel)]="form.email" required></label><label>Rôle<select name="role" [(ngModel)]="form.role"><option value="CLIENT">Client</option><option value="INSTALLER">Installateur</option></select></label><label>Mot de passe temporaire<input name="accountPassword" type="password" [(ngModel)]="form.password" required></label>@if(error){<div class="error">{{error}}</div>}<button class="btn" type="submit">Créer le compte</button></form></div></div>}
  `,
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent {
  private readonly service = inject(AdminService);
  accounts: Account[] = [];
  showForm = false;
  error = '';
  form: NewAccount = { name: '', email: '', role: 'CLIENT', password: '' };
  constructor() { this.loadAccounts(); }
  loadAccounts(): void { this.service.listAccounts().subscribe((accounts) => this.accounts = accounts); }
  roleLabel(role: Account['role']): string { return role === 'INSTALLER' ? 'Installateur' : role === 'ADMIN' ? 'Back-office' : 'Client'; }
  createAccount(): void {
    this.error = '';
    this.service.createAccount(this.form).subscribe({
      next: () => { this.showForm = false; this.form = { name: '', email: '', role: 'CLIENT', password: '' }; this.loadAccounts(); },
      error: () => this.error = 'Impossible de créer ce compte. Vérifiez que l’adresse email est disponible.'
    });
  }
}
