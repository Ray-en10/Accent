import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdminService, Dashboard } from '../services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div><p class="eyebrow">JEUDI 12 NOVEMBRE 2026</p><h1>Temps réel</h1></div>
      <span class="live-badge">● Données à jour</span>
    </header>
    @if (dashboard; as data) {
      <section class="stats">
        <article class="card"><span>Consommation totale</span><strong>{{data.totalConsumption | number:'1.0-0'}} <small>kWh</small></strong><em class="positive">↘ 8,4% <i>vs. mois dernier</i></em></article>
        <article class="card"><span>Sites actifs</span><strong>{{data.activeSites}} <small>sites</small></strong><em class="positive">↗ 12 nouveaux <i>ce mois</i></em></article>
        <article class="card"><span>Alertes à traiter</span><strong>{{data.alerts}} <small>alertes</small></strong><em class="warning">3 urgentes <i>à vérifier</i></em></article>
      </section>
      <section class="content-grid">
        <article class="card chart-card"><div class="section-title"><div><p class="eyebrow">SUIVI DU PARC</p><h2>Consommation globale</h2></div><select><option>30 derniers jours</option><option>Cette année</option></select></div><div class="big-chart">@for (bar of data.chart; track $index) {<div class="bar" [style.height.%]="bar"><span></span></div>}</div><div class="chart-labels"><span>01 nov.</span><span>08 nov.</span><span>15 nov.</span><span>22 nov.</span><span>Aujourd'hui</span></div></article>
        <article class="card distribution"><p class="eyebrow">RÉPARTITION</p><h2>Par type de site</h2><div class="donut"><b>1 248<small>sites</small></b></div><div class="legend"><span><i class="c-purple"></i>Particuliers <b>68%</b></span><span><i class="c-lime"></i>Professionnels <b>32%</b></span></div></article>
      </section>
      <section class="card table-card"><div class="section-title"><div><p class="eyebrow">ACTIVITÉ RÉCENTE</p><h2>Derniers comptes</h2></div></div><table><thead><tr><th>COMPTE</th><th>TYPE</th><th>STATUT</th><th>INSCRIPTION</th></tr></thead><tbody>@for (account of data.recentAccounts; track account.email) {<tr><td><span class="user-dot">{{account.name.charAt(0)}}</span><b>{{account.name}}</b><small>{{account.email}}</small></td><td>{{account.role}}</td><td><span class="status">● Actif</span></td><td>{{account.createdAt}}</td></tr>}</tbody></table></section>
    }
  `,
  styleUrls: ['./dashboard.component.css']
})
export class AdminComponent {
  private readonly service = inject(AdminService);
  dashboard: Dashboard | null = null;
  constructor() { this.service.dashboard().subscribe((dashboard) => this.dashboard = dashboard); }
}
