import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Account, AdminService, CustomerRequest, NewAccount } from '../services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-header"><div><p class="eyebrow">BACK-OFFICE</p><h1>Administration</h1></div><select class="section-select" [(ngModel)]="section"><option value="accounts">Liste des comptes</option><option value="requests">Demandes de compte ({{requests.length}})</option></select></header>
    @if (section === 'accounts') {<section class="card admin-card"><div class="section-title"><div><p class="eyebrow">ACCÈS UTILISATEURS</p><h2>Clients et installateurs</h2></div><div><span class="count">{{accounts.length}} comptes</span><button class="btn lime compact" (click)="showForm=true">+ Créer un compte</button></div></div>
      <table><thead><tr><th>COMPTE</th><th>RÔLE</th><th>STATUT</th><th>ACTIONS</th></tr></thead><tbody>@for (account of accounts; track account.id) {<tr><td><b>{{account.name}}</b><small>{{account.email}}</small></td><td>{{roleLabel(account.role)}}</td><td><select class="status-select" [ngClass]="account.status.toLowerCase()" [ngModel]="account.status" (ngModelChange)="changeAccountStatus(account, $event)"><option value="ACTIVE">Actif</option><option value="INACTIVE">Inactif</option></select></td><td class="table-actions"><button type="button" class="action view" (click)="selectedAccount=account">Voir plus</button><button type="button" class="action" (click)="editAccount(account)">Modifier</button><button type="button" class="action reject" (click)="deleteAccount(account)">Supprimer</button></td></tr>}</tbody></table>
    </section>}
    @else {<section class="card requests-card"><div class="section-title"><div><p class="eyebrow">PROSPECTS</p><h2>Demandes reçues</h2><p class="hint">Validez une demande pour générer et envoyer automatiquement ses accès.</p></div><span class="count">{{requests.length}} demandes</span></div>
      @if (!requests.length) {<div class="empty">Aucune demande pour le moment.</div>}
      @for (request of requests; track request.id) {<article class="request-row"><div class="request-main"><div class="request-avatar">{{request.name.charAt(0)}}</div><div><h3>{{request.name}}</h3><p>{{request.email}} · {{request.phone}}</p><small>{{request.city}}, {{request.governorate}} · {{request.customerType}}</small></div></div><div class="request-pack"><b>{{packLabel(request)}}</b><small>{{request.meter}} · {{request.payment}}</small></div><span class="request-status" [class]="request.status.toLowerCase()">{{statusLabel(request.status)}}</span><div class="request-actions"><button type="button" class="action view" (click)="selectedRequest=request">Voir plus</button><button type="button" class="action confirm" (click)="changeStatus(request, 'CONFIRMED')" [disabled]="request.status === 'CONFIRMED'">Confirmer</button></div></article>}
    </section>}
    @if (showForm) {<div class="modal-backdrop" (click)="showForm=false"><div class="modal account-modal card" (click)="$event.stopPropagation()"><button class="close" type="button" (click)="showForm=false">×</button><p class="eyebrow">{{editingAccount ? 'MODIFIER LE COMPTE' : 'NOUVEAU COMPTE'}}</p><h2>{{editingAccount ? 'Modifier le compte' : 'Créer un accès'}}</h2><p class="hint">{{editingAccount ? 'Mettez à jour les informations de ce compte.' : 'Un mot de passe sécurisé sera généré et envoyé automatiquement par email.'}}</p>
      @if (!editingAccount) {<div class="role-tabs"><button type="button" [class.active]="form.role==='CLIENT'" (click)="selectRole('CLIENT')">Client</button><button type="button" [class.active]="form.role==='INSTALLER'" (click)="selectRole('INSTALLER')">Installateur</button><button type="button" [class.active]="form.role==='ADMIN'" (click)="selectRole('ADMIN')">Back-office</button><button type="button" [class.active]="form.role==='NETWORK_MANAGER'" (click)="selectRole('NETWORK_MANAGER')">Responsable réseau</button></div>}
      <form (ngSubmit)="saveAccount()">
        <div class="account-form-grid">
          <label>Nom complet<input name="accountName" [(ngModel)]="form.name" required></label>
          <label>Email professionnel<input name="accountEmail" type="email" [(ngModel)]="form.email" required></label>
          @if (form.role === 'CLIENT') {
            <label>Téléphone<input name="phone" [(ngModel)]="form.phone" placeholder="+216 ..."></label>
            <label>Gouvernorat<select name="governorate" [(ngModel)]="form.governorate"><option value="">Choisir</option><option>Tunis</option><option>Ariana</option><option>Ben Arous</option><option>Manouba</option><option>Nabeul</option><option>Sousse</option><option>Sfax</option></select></label>
            <label>Ville<input name="city" [(ngModel)]="form.city" placeholder="Ville"></label>
            <label>Adresse d'installation<input name="address" [(ngModel)]="form.address" placeholder="Rue, quartier, repère"></label>
            <label>Type de compteur<select name="meterType" [(ngModel)]="form.meterType"><option>Monophasé</option><option>Triphasé</option></select></label>
            <label>Nombre de circuits<input name="circuitCount" type="number" min="1" max="8" [(ngModel)]="form.circuitCount"></label>
            <label>Puissance souscrite<select name="subscribedPower" [(ngModel)]="form.subscribedPower"><option>6 kVA</option><option>9 kVA</option><option>12 kVA</option><option>18 kVA</option></select></label>
          }
          @if (form.role === 'INSTALLER') {
            <label>Téléphone<input name="phone" [(ngModel)]="form.phone" placeholder="+216 ..."></label>
            <label>Zone d'intervention<input name="governorate" [(ngModel)]="form.governorate" placeholder="Ex. Grand Tunis"></label>
            <label>Ville principale<input name="city" [(ngModel)]="form.city"></label>
            <label>Adresse professionnelle<input name="address" [(ngModel)]="form.address"></label>
            <label>Spécialité<select name="meterType" [(ngModel)]="form.meterType"><option>Mono & Triphasé</option><option>Monophasé</option><option>Triphasé</option></select></label>
          }
          @if (form.role === 'ADMIN') {
            <label>Téléphone<input name="phone" [(ngModel)]="form.phone" placeholder="+216 ..."></label>
            <label>Service<select name="address" [(ngModel)]="form.address"><option>Administration générale</option><option>Supervision technique</option><option>Support SAV</option><option>Gestion commerciale</option></select></label>
            <label class="full">Permissions<span class="permission-list"><i>Gestion des comptes</i><i>Supervision du parc</i><i>Rapports</i></span></label>
          }
          @if (form.role === 'NETWORK_MANAGER') {
            <label>Téléphone<input name="phone" [(ngModel)]="form.phone" placeholder="+216 ..."></label>
            <label>Réseau / société<input name="address" [(ngModel)]="form.address" placeholder="Nom du réseau"></label>
            <label>Gouvernorat<input name="governorate" [(ngModel)]="form.governorate"></label>
            <label>Type d'accès<span class="permission-list"><i>Lecture seule</i><i>Tous les sites du réseau</i></span></label>
          }
        </div>
        @if(error){<div class="error">{{error}}</div>}@if(success){<div class="success">{{success}}</div>}<div class="modal-actions"><button type="button" class="action" (click)="showForm=false">Annuler</button><button class="btn" type="submit">{{editingAccount ? 'Enregistrer les modifications' : 'Créer et envoyer les accès'}}</button></div>
      </form>
    </div></div>}
    @if (selectedRequest; as request) {<div class="modal-backdrop" (click)="selectedRequest=null"><div class="modal detail-modal card" (click)="$event.stopPropagation()"><button class="close" type="button" (click)="selectedRequest=null">×</button><div class="detail-title"><div class="request-avatar">{{request.name.charAt(0)}}</div><div><p class="eyebrow">DEMANDE DU {{request.createdAt}}</p><h2>{{request.name}}</h2><span class="request-status" [class]="request.status.toLowerCase()">{{statusLabel(request.status)}}</span></div></div><div class="detail-grid"><div><small>Email</small><b>{{request.email}}</b></div><div><small>Téléphone</small><b>{{request.phone}}</b></div><div><small>Localisation</small><b>{{request.city}}, {{request.governorate}}</b></div><div><small>Adresse</small><b>{{request.address}}</b></div><div><small>Profil</small><b>{{request.customerType}}</b></div><div><small>Compteur</small><b>{{request.meter}}</b></div><div><small>Pack choisi</small><b>{{packLabel(request)}}</b></div><div><small>Paiement</small><b>{{request.payment}}</b></div></div>@if(request.notes){<div class="notes"><small>Précisions</small><p>{{request.notes}}</p></div>}<div class="detail-actions"><button type="button" class="btn lime" (click)="changeStatus(request, 'CONFIRMED')" [disabled]="request.status === 'CONFIRMED'">Confirmer le compte</button><button type="button" class="action reject" (click)="changeStatus(request, 'REJECTED')">Rejeter</button><button type="button" class="action pending" (click)="changeStatus(request, 'PENDING')">Mettre en attente</button></div></div></div>}
    @if (selectedAccount; as account) {<div class="modal-backdrop" (click)="selectedAccount=null"><div class="modal detail-modal card" (click)="$event.stopPropagation()"><button class="close" type="button" (click)="selectedAccount=null">×</button><div class="detail-title"><div class="request-avatar">{{account.name.charAt(0)}}</div><div><p class="eyebrow">COMPTE UTILISATEUR</p><h2>{{account.name}}</h2><span class="status" [class.inactive]="account.status === 'INACTIVE'">● {{accountStatusLabel(account.status)}}</span></div></div><div class="detail-grid"><div><small>Email</small><b>{{account.email}}</b></div><div><small>Rôle</small><b>{{roleLabel(account.role)}}</b></div><div><small>Statut</small><select class="status-select detail-status" [ngClass]="account.status.toLowerCase()" [ngModel]="account.status" (ngModelChange)="changeAccountStatus(account, $event)"><option value="ACTIVE">Actif</option><option value="INACTIVE">Inactif</option></select></div></div><div class="detail-actions"><button type="button" class="btn" (click)="editAccount(account); selectedAccount=null">Modifier le compte</button></div></div></div>}
  `,
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent {
  private readonly service = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  accounts: Account[] = [];
  requests: CustomerRequest[] = [];
  section: 'accounts' | 'requests' = 'accounts';
  showForm = false;
  editingAccount: Account | null = null;
  selectedRequest: CustomerRequest | null = null;
  selectedAccount: Account | null = null;
  error = '';
  success = '';
  form: NewAccount = { name: '', email: '', role: 'CLIENT', status: 'ACTIVE' };
  constructor() { this.loadAccounts(); this.loadRequests(); if (this.route.snapshot.queryParamMap.get('section') === 'requests') this.section = 'requests'; }
  loadAccounts(): void { this.service.listAccounts().subscribe((accounts) => this.accounts = accounts); }
  loadRequests(): void { this.service.requests().subscribe((requests) => this.requests = requests); }
  roleLabel(role: Account['role']): string { return role === 'INSTALLER' ? 'Installateur' : role === 'ADMIN' ? 'Back-office' : role === 'NETWORK_MANAGER' ? 'Responsable réseau' : 'Client'; }
  selectRole(role: NewAccount['role']): void {
    this.form = { ...this.form, role,
      meterType: role === 'CLIENT' ? 'Monophasé' : role === 'INSTALLER' ? 'Mono & Triphasé' : undefined,
      circuitCount: role === 'CLIENT' ? 4 : undefined,
      subscribedPower: role === 'CLIENT' ? '9 kVA' : undefined
    };
  }
  editAccount(account: Account): void {
    this.editingAccount = account;
    this.form = {
      name: account.name, email: account.email, role: account.role, status: account.status,
      phone: account.phone, governorate: account.governorate, city: account.city, address: account.address,
      meterType: account.meterType, circuitCount: account.circuitCount, subscribedPower: account.subscribedPower
    };
    this.error = '';
    this.showForm = true;
  }
  saveAccount(): void {
    this.error = '';
    this.success = '';
    const operation = this.editingAccount ? this.service.updateAccount(this.editingAccount.id, this.form) : this.service.createAccount(this.form);
    operation.subscribe({
      next: () => {
        if (this.editingAccount) {
          this.success = 'Les informations du compte ont été mises à jour.';
        } else {
          this.success = `Compte créé. Les identifiants ont été envoyés à ${this.form.email}.`;
        }
        this.editingAccount = null;
        this.loadAccounts();
        setTimeout(() => { this.showForm=false; this.success=''; this.form={name:'',email:'',role:'CLIENT',status:'ACTIVE'}; }, 900);
      },
      error: (error) => this.error = error.status === 503 ? 'MailDev est indisponible. Lancez « docker compose up -d maildev » puis réessayez.' : 'Impossible de créer ce compte. Vérifiez que l’adresse email est disponible.'
    });
  }
  deleteAccount(account: Account): void {
    if (!confirm(`Supprimer le compte de ${account.name} ?`)) return;
    this.service.deleteAccount(account.id).subscribe(() => this.loadAccounts());
  }
  changeAccountStatus(account: Account, status: Account['status']): void {
    this.service.updateAccount(account.id, { name: account.name, email: account.email, role: account.role, status }).subscribe({
      next: updated => account.status = updated.status,
      error: () => this.loadAccounts()
    });
  }
  accountStatusLabel(status: Account['status']): string { return status === 'ACTIVE' ? 'Actif' : 'Inactif'; }
  packLabel(request: CustomerRequest): string { return [request.soloQuantity ? `Solo ×${request.soloQuantity}` : '', request.duoQuantity ? `Duo ×${request.duoQuantity}` : ''].filter(Boolean).join(' · '); }
  statusLabel(status: CustomerRequest['status']): string { return status === 'CONFIRMED' ? 'Compte créé' : status === 'REJECTED' ? 'Rejetée' : 'En attente'; }
  changeStatus(request: CustomerRequest, status: CustomerRequest['status']): void {
    this.error = '';
    this.service.updateRequestStatus(request.id, status).subscribe({
      next: updated => { request.status = updated.status; this.loadRequests(); if (updated.status === 'CONFIRMED') { this.loadAccounts(); this.selectedRequest = null; } },
      error: response => this.error = response.status === 503 ? 'MailDev est indisponible : démarrez le service avant de confirmer.' : response.status === 409 ? 'Un compte existe déjà avec cette adresse email.' : 'Impossible de modifier le statut.'
    });
  }
}
