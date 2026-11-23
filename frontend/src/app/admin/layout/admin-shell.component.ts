import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService } from '../services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout">
      <aside>
        <a class="logo" routerLink="/admin"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span><span>Tricity</span></a>
        <div class="profile"><div class="avatar">A</div><div><b>Admin ACCENT</b><small>Back-office</small></div></div>
        <nav>
          <a routerLink="/admin" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-7 8 7v10a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg><span>Temps réel</span></a>
          <a routerLink="/admin/consommation" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8"/></svg><span>Par gouvernorat</span></a>
          <button class="nav-group" type="button" (click)="historyExpanded=!historyExpanded" [class.selected]="historyExpanded"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7"/></svg><span>Historique</span><svg class="nav-chevron" [class.open]="historyExpanded" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button>
          @if (historyExpanded) {<div class="subnav"><a routerLink="/admin/historique/energy" routerLinkActive="selected">Energy</a><a routerLink="/admin/historique/details" routerLinkActive="selected">Details</a><a routerLink="/admin/historique/comparateur" routerLinkActive="selected">Comparateur</a></div>}
          <a routerLink="/admin/rapport" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM9 12h6M9 16h6M9 8h3"/></svg><span>Rapport</span></a>
          <button class="nav-group" type="button" (click)="alertsExpanded=!alertsExpanded" [class.selected]="alertsExpanded"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v5m0-8v1"/></svg><span>Alerte</span><svg class="nav-chevron" [class.open]="alertsExpanded" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button>
          @if (alertsExpanded) {<div class="subnav"><a routerLink="/admin/alertes/gestion" routerLinkActive="selected">Gestion des alertes</a><a routerLink="/admin/alertes/historique" routerLinkActive="selected">Historique des alertes</a></div>}
          <a routerLink="/admin/administration" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-3.3 2.8-5 7-5s6.3 1.7 7 5"/></svg><span>Administration</span></a>
          <a routerLink="/admin/divers" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-3 8 3-8 3zM4 12l8 3 8-3M4 17l8 3 8-3"/></svg><span>Divers</span></a>
          <a class="logout" routerLink="/connexion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5m5-4 4-3-4-3m4 3H9"/></svg><span>Déconnexion</span></a>
        </nav>
      </aside>
      <main class="admin-main"><header class="topbar"><div class="search-wrap"><span class="search-icon">⌕</span><input [(ngModel)]="searchQuery" (keydown.enter)="search()" placeholder="Rechercher un compte, un site, une ville..." aria-label="Rechercher"><button *ngIf="searchQuery" class="clear-search" type="button" (click)="searchQuery=''">×</button></div><div class="topbar-actions"><button class="notification-button" type="button" (click)="notificationsOpen=!notificationsOpen" aria-label="Notifications"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><span class="notification-dot"></span></button><div class="notification-menu" *ngIf="notificationsOpen"><div class="notification-head"><b>Notifications</b><span>3 nouvelles</span></div><a routerLink="/admin/alertes"><i class="orange"></i><span><b>3 sites à surveiller</b><small>Consommation au-dessus du seuil</small></span></a><a routerLink="/admin/administration"><i class="purple"></i><span><b>Demandes de compte</b><small>Consultez les nouvelles demandes</small></span></a><a routerLink="/admin/rapport"><i class="green"></i><span><b>Rapport disponible</b><small>Le rapport mensuel est prêt</small></span></a></div><div class="topbar-user"><span class="topbar-avatar">A</span><span><b>Admin ACCENT</b><small>Back-office</small></span></div></div></header><div class="search-result" *ngIf="searchMessage">{{searchMessage}}</div><router-outlet /></main>
    </div>
  `,
  styleUrls: ['./admin-shell.component.css']
})
export class AdminShellComponent {
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  historyExpanded = false;
  alertsExpanded = false;
  notificationsOpen = false;
  searchQuery = '';
  searchMessage = '';
  search(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return;
    forkJoin({ accounts: this.admin.listAccounts(), requests: this.admin.requests(), regions: this.admin.regions() }).subscribe(data => {
      const account = data.accounts.find(item => `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(query));
      const request = data.requests.find(item => `${item.name} ${item.email} ${item.city} ${item.governorate}`.toLowerCase().includes(query));
      const region = data.regions.find(item => `${item.name} ${item.places.map(place => place.name).join(' ')}`.toLowerCase().includes(query));
      this.searchMessage = '';
      if (account) this.router.navigate(['/admin/administration'], { queryParams: { account: account.id } });
      else if (request) this.router.navigate(['/admin/administration'], { queryParams: { section: 'requests', request: request.id } });
      else if (region) this.router.navigate(['/admin/consommation', region.id]);
      else this.searchMessage = `Aucun résultat pour « ${this.searchQuery} ».`;
    });
  }
}
