import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout">
      <aside>
        <a class="logo" routerLink="/admin"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span><span>tricity</span></a>
        <div class="profile"><div class="avatar">A</div><div><b>Admin ACCENT</b><small>Back-office</small></div></div>
        <nav>
          <a routerLink="/admin" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-7 8 7v10a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg><span>Temps réel</span></a>
          <button class="nav-group" type="button" (click)="historyExpanded=!historyExpanded" [class.selected]="historyExpanded"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9m7 10V5m7 14v-7"/></svg><span>Historique</span><b [class.open]="historyExpanded">⌄</b></button>
          @if (historyExpanded) {<div class="subnav"><a routerLink="/admin/historique/energy" routerLinkActive="selected">Energy</a><a routerLink="/admin/historique/details" routerLinkActive="selected">Details</a><a routerLink="/admin/historique/comparateur" routerLinkActive="selected">Comparateur</a></div>}
          <a routerLink="/admin/rapport" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM9 12h6M9 16h6M9 8h3"/></svg><span>Rapport</span></a>
          <button class="nav-group" type="button" (click)="alertsExpanded=!alertsExpanded" [class.selected]="alertsExpanded"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v5m0-8v1"/></svg><span>Alerte</span><b [class.open]="alertsExpanded">⌄</b></button>
          @if (alertsExpanded) {<div class="subnav"><a routerLink="/admin/alertes/gestion" routerLinkActive="selected">Gestion des alertes</a><a routerLink="/admin/alertes/historique" routerLinkActive="selected">Historique des alertes</a></div>}
          <a routerLink="/admin/administration" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-3.3 2.8-5 7-5s6.3 1.7 7 5"/></svg><span>Administration</span></a>
          <a routerLink="/admin/divers" routerLinkActive="selected"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-3 8 3-8 3zM4 12l8 3 8-3M4 17l8 3 8-3"/></svg><span>Divers</span></a>
          <a class="logout" routerLink="/connexion"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5m5-4 4-3-4-3m4 3H9"/></svg><span>Déconnexion</span></a>
        </nav>
      </aside>
      <main class="admin-main"><router-outlet /></main>
    </div>
  `,
  styleUrls: ['./admin-shell.component.css']
})
export class AdminShellComponent {
  historyExpanded = true;
  alertsExpanded = true;
}
