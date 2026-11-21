import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../auth.service';

interface ClientDashboard {
  greeting: string;
  todayConsumption: number;
  dailyGoal: number;
  cycleConsumption: number;
  cycleGoal: number;
  progress: number;
  hourly: number[];
  circuits: { id?: number; name: string; consumption: number; share: number; trend: string; goal: number; equipment: string[] }[];
  alerts: string[];
}

type ClientSection = 'overview' | 'history' | 'circuits' | 'objectives' | 'reports' | 'notifications' | 'profile';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="client-layout">
    <aside class="sidebar">
      <a class="brand" routerLink="/"><span class="brand-mark">T</span><span>Tricity</span></a>

      <nav class="main-nav" aria-label="Navigation client">
        <button type="button" [class.active]="section === 'overview'" (click)="changeSection('overview')">
          <svg viewBox="0 0 24 24"><path d="M4 13h6V4H4zm10 7h6V11h-6zM4 20h6v-3H4zm10-13h6V4h-6z"/></svg>
          <span>Tableau de bord</span>
        </button>
        <button type="button" [class.active]="section === 'history'" (click)="changeSection('history')">
          <svg viewBox="0 0 24 24"><path d="M4 19V5m0 14h16M8 16v-5m4 5V7m4 9v-8"/></svg>
          <span>Historique</span>
        </button>
        <button type="button" [class.active]="section === 'circuits'" (click)="changeSection('circuits')">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v7m0 6v7M2 12h7m6 0h7M5 5l5 5m4 4 5 5m0-14-5 5m-4 4-5 5"/></svg>
          <span>Circuits & équipements</span>
        </button>
        <button type="button" [class.active]="section === 'objectives'" (click)="changeSection('objectives')">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>
          <span>Mes objectifs</span>
        </button>
        <button type="button" [class.active]="section === 'reports'" (click)="changeSection('reports')">
          <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 12h6M9 16h6M9 8h3"/></svg>
          <span>Rapports</span>
        </button>
        <button type="button" [class.active]="section === 'notifications'" (click)="toggleNotifications()">
          <svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
          <span>Notifications</span>
          <b class="nav-badge">3</b>
        </button>
      </nav>

      <button class="side-profile" type="button" (click)="openProfile()">
        <span class="avatar">{{ initials }}</span>
        <span><b>{{ user?.name || 'Client Tricity' }}</b><small>Client résidentiel</small></span>
      </button>
    </aside>

    <main class="client-main">
      <header class="topbar">
        <div>
          <p class="eyebrow">ESPACE CLIENT</p>
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="topbar-actions">
          <button class="icon-button" type="button" aria-label="Notifications" (click)="toggleNotifications()" [attr.aria-expanded]="notificationsOpen">
            <svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
            <span>3</span>
          </button>
          <button class="profile-button" type="button" (click)="toggleProfile()" [attr.aria-expanded]="profileOpen">
            <span class="avatar">{{ initials }}</span>
            <span class="profile-name">{{ user?.name || 'Client' }}</span>
            <b>⌄</b>
          </button>

          @if (profileOpen) {
            <div class="profile-popover">
              <div class="profile-head">
                <span class="avatar large">{{ initials }}</span>
                <div><b>{{ user?.name || 'Client Tricity' }}</b><small>{{ user?.email || 'client@tricity.tn' }}</small></div>
              </div>
              <div class="profile-info">
                <div><span>Gouvernorat</span><b>{{ profileGovernorate }}</b></div>
                <div><span>Ville</span><b>{{ profileCity }}</b></div>
                <div><span>Type de compteur</span><b>{{ meterType }} · {{ circuitCount }} circuits</b></div>
              </div>
              <button class="profile-page-link" type="button" (click)="openProfile()">Voir mes informations</button>
              <button class="logout" type="button" (click)="logout()">
                <svg viewBox="0 0 24 24"><path d="M10 5H5v14h5m5-4 4-3-4-3m4 3H9"/></svg>
                Se déconnecter
              </button>
            </div>
          }
          @if (notificationsOpen) {
            <div class="notification-popover">
              <div class="notification-popover-head"><div><p class="eyebrow">ACTUALITÉS</p><b>Notifications</b></div><button type="button" (click)="clearNotifications()">Tout lire</button></div>
              <button class="notification-item" type="button" (click)="changeSection('notifications')">
                <i class="orange-dot"></i><span><b>Objectif journalier presque atteint</b><small>Il reste 12 kWh pour rester dans votre objectif.</small><time>Il y a 18 minutes</time></span>
              </button>
              <button class="notification-item" type="button" (click)="changeSection('notifications')">
                <i class="yellow-dot"></i><span><b>Pic de consommation détecté</b><small>La climatisation dépasse son rythme habituel.</small><time>Hier à 18:42</time></span>
              </button>
              <button class="notification-item" type="button" (click)="changeSection('notifications')">
                <i class="green-dot"></i><span><b>Rapport du cycle disponible</b><small>Votre rapport du 8 mars au 7 mai est prêt.</small><time>12 mai à 08:00</time></span>
              </button>
              <button class="notification-all" type="button" (click)="changeSection('notifications')">Voir toutes les notifications →</button>
            </div>
          }
        </div>
      </header>

      @if (dashboard; as data) {
        @if (section === 'overview') {
          <section class="overview-head">
            <div><p>Bonjour, <b>{{ data.greeting }}</b></p><span>Voici l'état de votre consommation aujourd'hui.</span></div>
            <div class="live-status"><i></i> Mis à jour à l'instant</div>
          </section>

          <section class="metrics">
            <article class="metric-card orange-status">
              <div class="metric-top"><span>Aujourd'hui</span><small>Journée en cours</small></div>
              <strong>{{ data.todayConsumption }} <small>kWh</small></strong>
              <div class="progress"><i [style.width.%]="todayPercent"></i></div>
              <p><b>{{ todayRemaining >= 0 ? todayRemaining : 0 }} kWh</b> disponibles sur l'objectif</p>
            </article>
            <article class="metric-card green-status">
              <div class="metric-top"><span>Cycle STEG</span><small>8 mai — 7 juillet</small></div>
              <strong>{{ data.cycleConsumption }} <small>/ {{ data.cycleGoal }} kWh</small></strong>
              <div class="progress"><i [style.width.%]="data.progress"></i></div>
              <p><b>{{ data.progress }}%</b> de l'objectif bimestriel</p>
            </article>
            <article class="metric-card cost-status">
              <div class="metric-top"><span>Estimation du cycle</span><small>Palier 2 / 4</small></div>
              <strong>128,40 <small>DT</small></strong>
              <div class="status-line"><i></i><b>Dans l'objectif</b></div>
              <p>Projection : <b>596 kWh</b> en fin de cycle</p>
            </article>
          </section>

          <section class="dashboard-grid">
            <article class="panel chart-panel">
              <div class="panel-head">
                <div><p class="eyebrow">TEMPS RÉEL</p><h2>Consommation du jour</h2></div>
                <div class="segmented"><button class="active" type="button">24h</button><button type="button">Minute</button></div>
              </div>
              <div class="chart-wrap">
                <div class="chart-y"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
                <div class="bars">
                  @for (bar of data.hourly; track $index) {
                    <div class="bar-column"><i [style.height.%]="bar" [class.current]="$index === 17"></i></div>
                  }
                </div>
              </div>
              <div class="chart-hours"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span></div>
            </article>

            <article class="panel cycle-panel">
              <p class="eyebrow">CYCLE STEG EN COURS</p>
              <h2>Progression</h2>
              <div class="cycle-ring" [style.--progress]="data.progress + '%'">
                <div><b>{{ data.progress }}%</b><small>consommé</small></div>
              </div>
              <div class="cycle-stats"><div><span>Jours écoulés</span><b>31 / 61</b></div><div><span>Objectif prorata</span><b>315 kWh</b></div></div>
              <div class="projection"><i>↗</i><span><b>En avance de 4,2%</b><small>Vous maintenez votre objectif</small></span></div>
            </article>
          </section>

          <section class="panel circuits-preview">
            <div class="panel-head">
              <div><p class="eyebrow">RÉPARTITION PAR CIRCUIT</p><h2>Mes installations</h2></div>
              <button class="btn outline" type="button" (click)="changeSection('circuits')">Voir tous les circuits →</button>
            </div>
            <div class="circuit-grid">
              @for (circuit of data.circuits; track circuit.name) {
                <button class="circuit-card" type="button" (click)="changeSection('circuits')">
                  <span class="circuit-icon"><svg viewBox="0 0 24 24"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span>
                  <span class="circuit-content"><b>{{ circuit.name }}</b><small>{{ circuit.consumption }} kWh · {{ circuit.share }}%</small></span>
                  <em [class.good-trend]="circuit.trend.startsWith('-')">{{ circuit.trend }}</em>
                </button>
              }
            </div>
          </section>
        }

        @if (section === 'history') {
          <section class="panel section-panel">
            <div class="panel-head"><div><p class="eyebrow">HISTORIQUE</p><h2>Consommation</h2></div><div class="period-tabs"><button class="active">Jour</button><button>Semaine</button><button>Mois</button></div></div>
            <div class="history-summary"><div><span>Période sélectionnée</span><b>21 nov. 2026</b></div><div><span>Consommation</span><b>{{ data.todayConsumption }} kWh</b></div><div><span>Objectif</span><b>{{ data.dailyGoal }} kWh</b></div><div><span>Résultat</span><b class="orange-text">-40% sous l'objectif</b></div></div>
            <div class="history-chart"><div class="bars">@for (bar of data.hourly; track $index) {<div class="bar-column"><i [style.height.%]="bar"></i></div>}</div></div>
          </section>
        }

        @if (section === 'circuits') {
          <section class="panel section-panel">
            <div class="panel-head"><div><p class="eyebrow">INSTALLATION MONOPHASÉE</p><h2>Circuits & équipements</h2></div><button class="btn outline" type="button" (click)="circuitModalOpen = true">+ Ajouter un circuit</button></div>
            <div class="equipment-list">
              @for (circuit of data.circuits; track circuit.name) {
                <article>
                  <div class="equipment-head"><span class="circuit-icon"><svg viewBox="0 0 24 24"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span><div><b>{{ circuit.name }}</b><small>{{ circuit.consumption }} kWh aujourd'hui</small></div><div class="card-actions"><button type="button" (click)="editCircuit(circuit)">Modifier</button><button class="delete" type="button" (click)="deleteCircuit(circuit)">Supprimer</button></div></div>
                  <div class="equipment-body">
                    @for (equipment of circuit.equipment; track equipment) {
                      <div class="equipment-row"><span class="equipment-dot"></span><b>{{ equipment }}</b><span>Estimation disponible</span><button type="button">Fiche</button></div>
                    }
                  </div>
                </article>
              }
            </div>
          </section>
        }

        @if (section === 'objectives') {
          <section class="objective-layout">
            <article class="panel objective-card"><p class="eyebrow">OBJECTIF JOURNALIER</p><h2>{{ data.dailyGoal }} kWh</h2><p>Aujourd'hui : {{ data.todayConsumption }} kWh</p><div class="progress"><i [style.width.%]="todayPercent"></i></div><label>Modifier l'objectif<input type="number" [(ngModel)]="dailyGoal" name="dailyGoal"></label><button class="btn" type="button" (click)="saveGoals()">Enregistrer</button></article>
            <article class="panel objective-card"><p class="eyebrow">OBJECTIF BIMENSUEL</p><h2>{{ data.cycleGoal }} kWh</h2><p>Cycle actuel : {{ data.cycleConsumption }} kWh</p><div class="progress"><i [style.width.%]="data.progress"></i></div><label>Modifier l'objectif<input type="number" [(ngModel)]="cycleGoal" name="cycleGoal"></label><button class="btn" type="button" (click)="saveGoals()">Enregistrer</button></article>
          </section>
        }

        @if (section === 'reports') {
          <section class="panel section-panel">
            <div class="panel-head"><div><p class="eyebrow">DOCUMENTS</p><h2>Mes rapports</h2></div><button class="btn" type="button" (click)="showExport = !showExport">Exporter une période</button></div>
            @if (showExport) {
              <form class="export-form" (ngSubmit)="generateReport()"><label>Du<input type="date" [(ngModel)]="reportFrom" name="reportFrom"></label><label>Au<input type="date" [(ngModel)]="reportTo" name="reportTo"></label><button class="btn" type="submit">Générer PDF</button></form>
            }
            <div class="report-list">
              <article><span class="report-icon">PDF</span><div><b>Cycle 8 mars — 7 mai 2026</b><small>Rapport automatique · 4 fichiers dans le cycle</small></div><button type="button">Télécharger</button></article>
              <article><span class="report-icon">PDF</span><div><b>Cycle 8 janvier — 7 mars 2026</b><small>Rapport automatique · 412 kWh</small></div><button type="button">Télécharger</button></article>
              <article><span class="report-icon">CSV</span><div><b>Historique octobre 2026</b><small>Export à la demande · Données brutes</small></div><button type="button">Télécharger</button></article>
            </div>
          </section>
        }

        @if (section === 'notifications') {
          <section class="panel section-panel">
            <div class="panel-head"><div><p class="eyebrow">CENTRE D'ALERTES</p><h2>Notifications</h2></div><button class="btn outline" type="button" (click)="clearNotifications()">Tout marquer comme lu</button></div>
            <div class="notification-list">
              <article><i class="orange-dot"></i><div><b>Objectif journalier presque atteint</b><p>Il reste 12 kWh pour rester dans votre objectif.</p><small>Il y a 18 minutes</small></div></article>
              <article><i class="yellow-dot"></i><div><b>Pic de consommation détecté</b><p>La climatisation a dépassé son rythme habituel.</p><small>Hier à 18:42</small></div></article>
              <article><i class="green-dot"></i><div><b>Rapport du cycle disponible</b><p>Votre rapport du 8 mars au 7 mai est prêt.</p><small>12 mai à 08:00</small></div></article>
            </div>
          </section>
        }

        @if (section === 'profile') {
          <section class="profile-page">
            <article class="panel profile-identity">
              <div class="profile-cover"></div>
              <div class="profile-identity-body">
                <span class="avatar profile-avatar">{{ initials }}</span>
                <div><p class="eyebrow">COMPTE CLIENT</p><h2>{{ user?.name || 'Client Tricity' }}</h2><p>{{ user?.email || 'client@tricity.tn' }}</p></div>
                <span class="account-status">Compte actif</span>
              </div>
            </article>

            <div class="profile-columns">
              <article class="panel profile-details">
                <div class="panel-head"><div><p class="eyebrow">COORDONNÉES</p><h2>Mes informations</h2></div></div>
                <div class="detail-grid">
                  <div><span>Nom complet</span><b>{{ user?.name || 'Client Tricity' }}</b></div>
                  <div><span>Adresse e-mail</span><b>{{ user?.email || 'client@tricity.tn' }}</b></div>
                  <div><span>Gouvernorat</span><b>{{ profileGovernorate }}</b></div>
                  <div><span>Ville</span><b>{{ profileCity }}</b></div>
                  <div class="full"><span>Adresse d'installation</span><b>{{ profileAddress }}</b></div>
                  <div><span>Type d'abonnement</span><b>Résidentiel B2C</b></div>
                  <div><span>Type de compteur</span><b>{{ meterType }}</b></div>
                  <div><span>Nombre de circuits</span><b>{{ circuitCount }} maximum</b></div>
                  <div><span>Puissance souscrite</span><b>{{ subscribedPower }}</b></div>
                </div>
              </article>

              <article class="panel password-card">
                <p class="eyebrow">SÉCURITÉ</p>
                <h2>Mot de passe</h2>
                <p class="security-note">Vous pouvez mettre à jour votre mot de passe. Les autres informations personnelles sont gérées lors de l'installation.</p>
                <form class="password-form" (ngSubmit)="changePassword()">
                  <label>Mot de passe actuel<input type="password" [(ngModel)]="passwordCurrent" name="profilePasswordCurrent" required></label>
                  <label>Nouveau mot de passe<input type="password" [(ngModel)]="passwordNew" name="profilePasswordNew" minlength="8" required></label>
                  <label>Confirmation du nouveau mot de passe<input type="password" [(ngModel)]="passwordConfirm" name="profilePasswordConfirm" required></label>
                  @if (passwordMessage) { <p [class.error]="passwordError">{{ passwordMessage }}</p> }
                  <button class="btn" type="submit">Modifier le mot de passe</button>
                </form>
              </article>
            </div>
          </section>
        }
      } @else {
        <section class="loading"><span></span><p>Chargement de vos données...</p></section>
      }
    </main>

    @if (circuitModalOpen) {
      <div class="modal-backdrop" (mousedown)="circuitModalOpen = false">
        <section class="circuit-modal" role="dialog" aria-modal="true" aria-labelledby="circuit-modal-title" (mousedown)="$event.stopPropagation()">
          <div class="modal-head">
            <div><p class="eyebrow">{{ editingCircuitId ? 'MODIFICATION' : 'NOUVELLE CONFIGURATION' }}</p><h2 id="circuit-modal-title">{{ editingCircuitId ? 'Modifier le circuit' : 'Ajouter un circuit' }}</h2></div>
            <button class="modal-close" type="button" (click)="circuitModalOpen = false" aria-label="Fermer">×</button>
          </div>
          <form class="circuit-form" (ngSubmit)="saveCircuit()">
            <div class="form-grid">
              <label>Nom du circuit<input type="text" [(ngModel)]="circuitForm.name" name="circuitName" placeholder="Ex. Climatisation étage" required></label>
              <label>Compteur<select [(ngModel)]="circuitForm.meter" name="circuitMeter"><option value="Compteur 1">Compteur 1</option><option value="Compteur 2">Compteur 2</option></select></label>
              <label>Type de circuit<select [(ngModel)]="circuitForm.type" name="circuitType"><option value="Mesuré">Mesuré</option><option value="Calculé">Calculé — Général moins les autres circuits</option></select></label>
              <label>Objectif journalier (kWh)<input type="number" min="1" [(ngModel)]="circuitForm.goal" name="circuitGoal" required></label>
              <label class="full">Équipement principal ou liste d'équipements<input type="text" [(ngModel)]="circuitForm.equipment" name="circuitEquipment" placeholder="Ex. climatiseur, chauffe-eau"></label>
            </div>
            <div class="modal-note"><b>Modèle d'installation</b><span>Jusqu'à 3 circuits mesurés et 1 circuit calculé « Autres » par compteur. Deux compteurs peuvent être configurés pour atteindre 8 circuits.</span></div>
            @if (circuitMessage) { <p class="circuit-success">{{ circuitMessage }}</p> }
            <div class="modal-actions"><button class="btn outline" type="button" (click)="closeCircuitModal()">Annuler</button><button class="btn" type="submit">{{ editingCircuitId ? 'Enregistrer les modifications' : 'Ajouter le circuit' }}</button></div>
          </form>
        </section>
      </div>
    }
  </div>
  `,
  styles: [`
    :host{display:block}.client-layout{min-height:100vh;display:grid;grid-template-columns:250px 1fr;background:#f7f8fb}.sidebar{height:100vh;position:sticky;top:0;background:#fff;border-right:1px solid var(--line);padding:24px 18px;display:flex;flex-direction:column}.brand{height:48px;display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font:700 1.45rem "Space Grotesk";letter-spacing:-.06em}.brand-mark{width:34px;height:34px;border-radius:10px;background:var(--brand);color:var(--lime);display:grid;place-items:center;font-size:1rem}.main-nav{display:grid;gap:5px;margin-top:32px}.main-nav button{width:100%;border:0;border-radius:9px;background:transparent;color:#73788a;display:flex;align-items:center;gap:12px;padding:11px 12px;text-align:left;cursor:pointer;font-weight:650}.main-nav button svg,.icon-button svg,.logout svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8}.main-nav button.active{background:#f0edf7;color:var(--brand)}.nav-badge{margin-left:auto;width:20px;height:20px;border-radius:50%;background:var(--brand);color:white;display:grid;place-items:center;font-size:.68rem}.side-profile{margin-top:auto;border:0;border-top:1px solid var(--line);background:transparent;padding:18px 4px 2px;display:flex;align-items:center;gap:10px;text-align:left;cursor:pointer}.avatar{width:38px;height:38px;border-radius:50%;background:var(--lime);color:var(--brand);display:grid;place-items:center;font-weight:800}.side-profile b,.side-profile small{display:block}.side-profile small{color:var(--muted);font-size:.72rem}.client-main{min-width:0;padding:28px 38px 50px}.topbar{height:74px;display:flex;justify-content:space-between;align-items:flex-start;position:relative}.topbar h1{font-size:1.9rem;margin-top:4px}.topbar-actions{display:flex;align-items:center;gap:10px}.icon-button{width:42px;height:42px;border:1px solid var(--line);border-radius:50%;background:white;display:grid;place-items:center;position:relative;cursor:pointer}.icon-button span{position:absolute;right:-2px;top:-4px;width:17px;height:17px;border-radius:50%;background:var(--red);color:white;font-size:.62rem;display:grid;place-items:center}.profile-button{height:42px;border:1px solid var(--line);background:white;border-radius:22px;padding:3px 10px 3px 3px;display:flex;align-items:center;gap:8px;cursor:pointer}.profile-button .avatar{width:34px;height:34px}.profile-name{font-weight:700}.profile-button>b{color:var(--muted)}.profile-popover,.notification-popover{position:absolute;right:0;top:52px;width:330px;background:white;border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 45px rgba(31,27,49,.16);padding:16px;z-index:30}.profile-head{display:flex;gap:11px;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line)}.avatar.large{width:46px;height:46px}.profile-head b,.profile-head small{display:block}.profile-head small{color:var(--muted)}.profile-info{display:grid;gap:8px;padding:13px 0}.profile-info div{display:flex;justify-content:space-between;gap:12px;font-size:.78rem}.profile-info span{color:var(--muted)}.profile-info b{text-align:right}.profile-page-link{width:100%;border:1px solid var(--line);background:#fafbfc;border-radius:8px;padding:9px;color:var(--brand);font-weight:700;cursor:pointer}.password-form{display:grid;gap:8px;margin-top:10px}.password-form label{display:grid;gap:4px;font-size:.72rem;font-weight:700}.password-form input{border:1px solid var(--line);border-radius:7px;padding:10px}.password-form p{color:var(--green);font-size:.75rem;margin:0}.password-form p.error{color:var(--red)}.logout{width:100%;border:0;border-top:1px solid var(--line);margin-top:12px;padding:12px 2px 2px;background:white;color:var(--red);display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-weight:700}.notification-popover{right:52px;width:390px;padding:0;overflow:hidden}.notification-popover-head{display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--line)}.notification-popover-head p{margin:0}.notification-popover-head>b{font-size:1.1rem}.notification-popover-head button{border:0;background:none;color:var(--brand);font-weight:700;cursor:pointer}.notification-item{width:100%;border:0;border-bottom:1px solid #eff1f5;background:white;padding:13px 16px;display:flex;gap:11px;text-align:left;cursor:pointer}.notification-item i{width:9px;height:9px;border-radius:50%;margin-top:5px}.notification-item span{display:grid}.notification-item small{color:var(--muted);margin:2px 0}.notification-item time{color:#a0a4b1;font-size:.68rem}.notification-all{width:100%;border:0;background:#fafbfc;padding:12px;color:var(--brand);font-weight:700;cursor:pointer}.orange-dot{background:var(--orange)}.yellow-dot{background:var(--yellow)}.green-dot{background:var(--green)}.overview-head{display:flex;justify-content:space-between;align-items:end;margin:12px 0 22px}.overview-head p{font:600 1.8rem "Space Grotesk";margin:0}.overview-head p b{color:var(--brand)}.overview-head span{color:var(--muted)}.live-status{font-size:.78rem;color:var(--muted)}.live-status i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--green);margin-right:5px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.metric-card,.panel{background:white;border:1px solid var(--line);border-radius:14px}.metric-card{padding:20px}.metric-top{display:flex;justify-content:space-between;align-items:center}.metric-top span{font-weight:800}.metric-top small{color:var(--muted)}.metric-card>strong{display:block;font:700 2.25rem "Space Grotesk";margin:16px 0 12px}.metric-card>strong small{font-size:.9rem;color:var(--muted)}.progress{height:7px;background:#eceaf0;border-radius:20px;overflow:hidden}.progress i{height:100%;display:block;background:var(--lime);border-radius:20px}.orange-status .progress i{background:var(--orange)}.green-status .progress i{background:var(--lime)}.metric-card p{color:var(--muted);font-size:.78rem;margin:10px 0 0}.status-line{display:flex;align-items:center;gap:7px;color:var(--green);margin:5px 0}.status-line i{width:8px;height:8px;border-radius:50%;background:var(--green)}.dashboard-grid{display:grid;grid-template-columns:1.75fr .75fr;gap:16px;margin-top:16px}.panel{padding:22px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start}.panel-head h2{font-size:1.55rem;margin-top:5px}.segmented{background:#f3f4f7;border-radius:8px;padding:3px}.segmented button,.period-tabs button{border:0;background:transparent;border-radius:6px;padding:7px 10px;color:var(--muted);cursor:pointer}.segmented button.active,.period-tabs button.active{background:white;color:var(--ink);box-shadow:0 2px 8px rgba(20,20,30,.08)}.chart-wrap{display:grid;grid-template-columns:28px 1fr;height:230px;margin-top:20px}.chart-y{display:flex;flex-direction:column;justify-content:space-between;color:#9297a6;font-size:.68rem;padding-bottom:2px}.bars{height:100%;display:flex;align-items:end;gap:5px;border-bottom:1px solid var(--line);background:repeating-linear-gradient(to bottom,var(--line) 0,var(--line) 1px,transparent 1px,transparent 57px)}.bar-column{flex:1;height:100%;display:flex;align-items:end}.bar-column i{width:100%;max-width:18px;margin:auto;display:block;min-height:3px;border-radius:5px 5px 0 0;background:#c7c0d6}.bar-column i.current{background:var(--brand)}.chart-hours{display:flex;justify-content:space-between;margin:8px 0 0 28px;color:var(--muted);font-size:.68rem}.cycle-panel{text-align:center}.cycle-panel h2{font-size:1.55rem;margin-top:5px}.cycle-ring{width:150px;height:150px;border-radius:50%;margin:18px auto;background:conic-gradient(var(--lime) var(--progress),#eceaf0 0);display:grid;place-items:center}.cycle-ring:before{content:"";grid-area:1/1;width:118px;height:118px;border-radius:50%;background:white}.cycle-ring div{grid-area:1/1;z-index:1}.cycle-ring b,.cycle-ring small{display:block}.cycle-ring b{font:700 1.9rem "Space Grotesk"}.cycle-ring small{color:var(--muted)}.cycle-stats{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 0}.cycle-stats span,.cycle-stats b{display:block;font-size:.72rem}.cycle-stats span{color:var(--muted)}.projection{display:flex;align-items:center;gap:8px;text-align:left;margin-top:14px;padding:9px;background:#f1f7ef;border-radius:9px}.projection i{width:30px;height:30px;border-radius:8px;background:var(--lime);display:grid;place-items:center;font-style:normal}.projection b,.projection small{display:block;font-size:.72rem}.projection small{color:var(--muted)}.circuits-preview{margin-top:16px}.circuit-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.circuit-card{border:1px solid var(--line);border-radius:10px;background:#fafbfc;padding:12px;display:flex;align-items:center;gap:9px;text-align:left;cursor:pointer}.circuit-icon{width:34px;height:34px;border-radius:9px;background:var(--lime);display:grid;place-items:center;flex:none}.circuit-icon svg{width:17px;height:17px;fill:none;stroke:var(--brand);stroke-width:1.8}.circuit-content b,.circuit-content small{display:block}.circuit-content small{color:var(--muted);font-size:.68rem}.circuit-card em{margin-left:auto;color:var(--red);font-style:normal;font-size:.68rem}.circuit-card em.good-trend{color:var(--green)}.section-panel{margin-top:12px}.period-tabs{background:#f3f4f7;padding:3px;border-radius:8px}.history-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:22px}.history-summary div{border:1px solid var(--line);border-radius:9px;padding:12px}.history-summary span,.history-summary b{display:block}.history-summary span{color:var(--muted);font-size:.72rem}.orange-text{color:var(--orange)}.history-chart{height:280px;margin-top:25px}.equipment-list{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}.equipment-list article{border:1px solid var(--line);border-radius:11px;overflow:hidden}    .equipment-head{display:flex;align-items:center;gap:10px;padding:13px}.card-actions{margin-left:auto;display:flex;gap:5px}.card-actions button{border:1px solid var(--line);border-radius:7px;background:white;color:var(--brand);padding:6px 8px;font-size:.72rem;font-weight:700;cursor:pointer}.card-actions button.delete{color:var(--red)}.equipment-head small{display:block;color:var(--muted)}.equipment-head em{margin-left:auto;color:var(--green);font-style:normal}.equipment-body{border-top:1px solid var(--line)}.equipment-row{display:grid;grid-template-columns:8px 1fr auto auto;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid #f0f1f4}.equipment-row:last-child{border:0}.equipment-dot{width:7px;height:7px;border-radius:50%;background:var(--lime)}.equipment-row span{font-size:.72rem;color:var(--muted)}.equipment-row button{border:0;background:none;color:var(--brand);font-weight:700;cursor:pointer}.objective-layout{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}.objective-card h2{font-size:2.4rem;margin:12px 0}.objective-card label{display:grid;gap:6px;margin:18px 0 10px;font-weight:700}.objective-card input{border:1px solid var(--line);border-radius:8px;padding:10px}.export-form{display:flex;align-items:end;gap:10px;padding:14px;border-radius:9px;background:#f7f8fb;margin-top:16px}.export-form label{display:grid;gap:5px;font-size:.75rem;font-weight:700}.export-form input{border:1px solid var(--line);border-radius:8px;padding:8px}.report-list{display:grid;gap:8px;margin-top:18px}.report-list article{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:10px;padding:12px}.report-icon{width:44px;height:44px;border-radius:9px;background:#fff0f0;color:var(--red);display:grid;place-items:center;font-size:.68rem;font-weight:800}.report-list article:nth-child(3) .report-icon{background:#edf7ef;color:var(--green)}.report-list div{display:grid}.report-list small{color:var(--muted)}.report-list button{margin-left:auto;border:0;background:transparent;color:var(--brand);font-weight:700;cursor:pointer}.notification-list{margin-top:16px}.notification-list article{display:flex;gap:12px;border-bottom:1px solid var(--line);padding:14px 4px}.notification-list i{width:10px;height:10px;border-radius:50%;margin-top:6px}.notification-list p{margin:3px 0;color:var(--muted)}.notification-list small{color:var(--muted)}.profile-page{display:grid;gap:16px}.profile-identity{padding:0;overflow:hidden}.profile-cover{height:110px;background:linear-gradient(120deg,var(--brand) 0%,#60478d 60%,var(--lime) 160%)}.profile-identity-body{min-height:92px;padding:12px 22px 16px 110px;position:relative;display:flex;align-items:center}.profile-avatar{position:absolute;left:22px;top:-38px;width:76px;height:76px;border:5px solid white;font-size:1.45rem}.profile-identity-body h2{font-size:1.55rem;margin:3px 0}.profile-identity-body p{margin:0;color:var(--muted)}.account-status{margin-left:auto;color:var(--green);background:#edf7ef;border-radius:20px;padding:7px 11px;font-size:.75rem;font-weight:700}.profile-columns{display:grid;grid-template-columns:1.55fr .75fr;gap:16px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.detail-grid div{border:1px solid var(--line);border-radius:9px;padding:12px}.detail-grid div.full{grid-column:1/-1}.detail-grid span,.detail-grid b{display:block}.detail-grid span{color:var(--muted);font-size:.72rem}.password-card h2{font-size:1.55rem;margin:6px 0}.security-note{color:var(--muted);font-size:.78rem}.password-card .btn{margin-top:8px}.modal-backdrop{position:fixed;inset:0;background:rgba(28,25,39,.48);backdrop-filter:blur(4px);z-index:100;display:grid;place-items:center;padding:20px}.circuit-modal{width:min(650px,100%);background:white;border-radius:16px;box-shadow:0 24px 70px rgba(27,24,45,.25);padding:24px}.modal-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:14px}.modal-head h2{font-size:1.65rem;margin-top:5px}.modal-close{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;background:white;font-size:1.25rem;cursor:pointer}.circuit-form{display:grid;gap:14px;margin-top:18px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form-grid label{display:grid;gap:6px;font-size:.78rem;font-weight:700}.form-grid label.full{grid-column:1/-1}.form-grid input,.form-grid select{border:1px solid var(--line);border-radius:8px;padding:10px;font:inherit;background:white}.modal-note{display:grid;grid-template-columns:150px 1fr;gap:10px;border-radius:9px;background:#f7f8fb;padding:12px;font-size:.75rem}.modal-note b{color:var(--brand)}.modal-note span{color:var(--muted)}.modal-actions{display:flex;justify-content:flex-end;gap:8px}.circuit-success{color:var(--green);font-weight:700;margin:0}.loading{height:60vh;display:grid;place-content:center;text-align:center;color:var(--muted)}.loading span{width:38px;height:38px;border:4px solid #e5e1ec;border-top-color:var(--brand);border-radius:50%;animation:spin 1s linear infinite;margin:auto}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:1100px){.sidebar{width:210px}.client-layout{grid-template-columns:210px 1fr}.dashboard-grid,.profile-columns{grid-template-columns:1fr}.cycle-panel{display:none}.circuit-grid{grid-template-columns:1fr 1fr}.equipment-list{grid-template-columns:1fr}}@media(max-width:800px){.client-layout{grid-template-columns:1fr}.sidebar{height:auto;position:relative;width:auto;border-right:0;border-bottom:1px solid var(--line);padding:12px 18px}.brand{height:38px}.main-nav{display:flex;margin:10px 0 0;overflow:auto}.main-nav button{width:auto;white-space:nowrap}.main-nav button span{font-size:.75rem}.main-nav button svg{width:17px}.side-profile{display:none}.client-main{padding:18px}.topbar h1{font-size:1.35rem}.profile-name{display:none}.metrics,.objective-layout{grid-template-columns:1fr}.dashboard-grid{grid-template-columns:1fr}.overview-head{align-items:start}.profile-popover{width:min(330px,calc(100vw - 36px))}.notification-popover{right:0;width:min(390px,calc(100vw - 36px))}.history-summary{grid-template-columns:1fr 1fr}.export-form{align-items:stretch;flex-direction:column}.profile-identity-body{padding-left:100px}.account-status{display:none}}@media(max-width:520px){.topbar{height:64px}.live-status{display:none}.overview-head p{font-size:1.35rem}.metric-card>strong{font-size:1.8rem}.circuit-grid{grid-template-columns:1fr}.chart-wrap{height:190px}.history-summary,.detail-grid,.form-grid{grid-template-columns:1fr}.panel{padding:16px}.main-nav button span{display:none}.main-nav button{padding:10px}.main-nav button.active{padding:10px 14px}.circuit-card{width:100%}.profile-identity-body{padding:48px 16px 16px}.profile-avatar{left:16px}.detail-grid div.full{grid-column:auto}.modal-note{grid-template-columns:1fr}.modal-actions{flex-direction:column-reverse}.modal-actions .btn{width:100%}}
  `]
})
export class ClientDashboardComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  dashboard: ClientDashboard | null = null;
  section: ClientSection = 'overview';
  profileOpen = false;
  notificationsOpen = false;
  circuitModalOpen = false;
  showPasswordForm = false;
  showExport = false;
  passwordCurrent = '';
  passwordNew = '';
  passwordConfirm = '';
  passwordMessage = '';
  passwordError = false;
  reportFrom = '';
  reportTo = '';
  dailyGoal = 30;
  cycleGoal = 620;
  circuitForm = { name: '', meter: 'Compteur 1', type: 'Mesuré', goal: 20, equipment: '' };
  circuitMessage = '';
  editingCircuitId: number | null = null;

  readonly user: User | null = this.auth.currentUser();

  get initials(): string {
    const name = this.user?.name?.trim() || 'Client';
    return name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  get profileGovernorate(): string { return this.user?.governorate || localStorage.getItem('tricity-governorate') || 'Tunis'; }
  get profileCity(): string { return this.user?.city || localStorage.getItem('tricity-city') || 'La Marsa'; }
  get profileAddress(): string { return this.user?.address || localStorage.getItem('tricity-address') || 'Adresse enregistrée lors de l\'installation'; }
  get meterType(): string { return this.user?.meterType || 'Monophasé'; }
  get circuitCount(): number { return this.user?.circuitCount || 4; }
  get subscribedPower(): string { return this.user?.subscribedPower || '9 kVA'; }
  get todayPercent(): number { return this.dashboard ? Math.min(100, Math.round(this.dashboard.todayConsumption / this.dailyGoal * 100)) : 0; }
  get todayRemaining(): number { return this.dailyGoal - (this.dashboard?.todayConsumption || 0); }

  get pageTitle(): string {
    return {
      overview: 'Tableau de bord',
      history: 'Historique',
      circuits: 'Circuits',
      objectives: 'Objectifs',
      reports: 'Rapports',
      notifications: 'Notifications',
      profile: 'Mon profil'
    }[this.section];
  }

  constructor() {
    const profileParam = new URL(window.location.href).searchParams.get('view');
    this.section = profileParam === 'profil' ? 'profile' : 'overview';
    this.http.get<ClientDashboard>('/api/client/dashboard', {
      params: { name: this.user?.name ?? 'Client' }
    }).subscribe({
      next: data => {
        this.dashboard = {
          ...data,
          circuits: data.circuits.map((circuit, index) => ({
            ...circuit,
            goal: index === 0 ? 120 : index === 1 ? 150 : index === 2 ? 100 : 60,
            equipment: index === 0 ? ['Éclairage intérieur', 'Éclairage extérieur'] :
              index === 1 ? ['Réfrigérateur', 'Télévision', 'Lave-linge'] :
              index === 2 ? ['Climatiseur salon', 'Climatiseur chambre'] : ['Autres appareils']
          }))
        };
        this.loadPersistedCircuits();
      },
      error: () => {
        this.dashboard = this.getFallbackDashboard();
        this.loadPersistedCircuits();
      }
    });
  }

  changeSection(section: ClientSection): void {
    this.section = section;
    this.profileOpen = false;
    this.notificationsOpen = false;
    if (section === 'profile') this.router.navigate(['/client'], { queryParams: { view: 'profil' } });
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    this.notificationsOpen = false;
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    this.profileOpen = false;
  }

  openProfile(): void {
    this.profileOpen = false;
    this.notificationsOpen = false;
    this.section = 'profile';
    this.router.navigate(['/client'], { queryParams: { view: 'profil' } });
  }

  saveGoals(): void {
    localStorage.setItem('tricity-daily-goal', String(this.dailyGoal));
    localStorage.setItem('tricity-cycle-goal', String(this.cycleGoal));
  }

  changePassword(): void {
    this.passwordMessage = '';
    this.passwordError = false;
    if (this.passwordNew.length < 8) {
      this.passwordError = true;
      this.passwordMessage = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (this.passwordNew !== this.passwordConfirm) {
      this.passwordError = true;
      this.passwordMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }
    if (!this.user?.id) {
      this.passwordError = true;
      this.passwordMessage = 'Votre session utilisateur est invalide.';
      return;
    }
    this.http.put<User>(`/api/auth/users/${this.user.id}/password`, {
      currentPassword: this.passwordCurrent,
      newPassword: this.passwordNew
    }).subscribe({
      next: updatedUser => {
        this.auth.saveUser(updatedUser);
        this.passwordMessage = `Mot de passe modifié avec succès. Une confirmation a été envoyée à ${updatedUser.email}.`;
        this.passwordCurrent = '';
        this.passwordNew = '';
        this.passwordConfirm = '';
      },
      error: response => {
        this.passwordError = true;
        this.passwordMessage = response.status === 401
          ? 'Le mot de passe actuel est incorrect.'
          : 'Impossible de modifier le mot de passe pour le moment.';
      }
    });
  }

  generateReport(): void {
    if (this.reportFrom && this.reportTo) {
      window.print();
    }
  }

  clearNotifications(): void {
    this.dashboard = this.dashboard ? { ...this.dashboard, alerts: [] } : null;
  }

  saveCircuit(): void {
    const name = this.circuitForm.name.trim();
    if (!name) return;
    if (this.dashboard && this.dashboard.circuits.length >= 8) {
      if (this.editingCircuitId) {
        // Editing an existing circuit does not increase the 8-circuit limit.
      } else {
      this.circuitMessage = 'La limite est de 8 circuits maximum (2 compteurs × 4 circuits).';
      return;
      }
    }
    const equipment = this.circuitForm.equipment
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    const payload = {
      name,
      meter: this.circuitForm.meter,
      type: this.circuitForm.type,
      goal: this.circuitForm.goal,
      equipment: equipment.join(', ')
    };
    if (!this.user?.id) {
      this.circuitMessage = 'Votre session utilisateur est invalide.';
      return;
    }
    if (this.editingCircuitId) {
      this.http.put<{ id: number; name: string; meter: string; type: string; goal: number; equipment: string }>(
        `/api/client/${this.user.id}/circuits/${this.editingCircuitId}`, payload
      ).subscribe({
        next: circuit => this.applySavedCircuit(circuit),
        error: () => this.circuitMessage = 'Impossible de modifier ce circuit.'
      });
    } else {
      this.http.post<{ id: number; name: string; meter: string; type: string; goal: number; equipment: string }>(
        `/api/client/${this.user.id}/circuits`, payload
      ).subscribe({
        next: circuit => this.applySavedCircuit(circuit),
        error: () => this.circuitMessage = 'Impossible d’ajouter ce circuit.'
      });
    }
  }

  editCircuit(circuit: { id?: number; name: string; goal: number; equipment: string[] }): void {
    if (!circuit.id) {
      this.circuitMessage = 'Ce circuit exemple ne peut pas être modifié avant sa création dans le système.';
      this.circuitModalOpen = true;
      this.editingCircuitId = null;
      this.circuitForm = { name: circuit.name, meter: 'Compteur 1', type: 'Mesuré', goal: circuit.goal, equipment: circuit.equipment.join(', ') };
      return;
    }
    this.editingCircuitId = circuit.id;
    this.circuitForm = { name: circuit.name, meter: 'Compteur 1', type: 'Mesuré', goal: circuit.goal, equipment: circuit.equipment.join(', ') };
    this.circuitModalOpen = true;
  }

  deleteCircuit(circuit: { id?: number; name: string }): void {
    if (!circuit.id) {
      this.circuitMessage = 'Ce circuit exemple ne peut pas être supprimé dans cette démonstration.';
      return;
    }
    if (!this.user?.id) return;
    if (!window.confirm(`Supprimer le circuit « ${circuit.name} » ?`)) return;
    this.http.delete(`/api/client/${this.user.id}/circuits/${circuit.id}`).subscribe({
      next: () => {
        if (this.dashboard) this.dashboard = { ...this.dashboard, circuits: this.dashboard.circuits.filter(item => item.id !== circuit.id) };
      },
      error: () => this.circuitMessage = 'Impossible de supprimer ce circuit.'
    });
  }

  closeCircuitModal(): void {
    this.circuitModalOpen = false;
    this.editingCircuitId = null;
    this.circuitMessage = '';
  }

  private loadPersistedCircuits(): void {
    if (!this.user?.id || !this.dashboard) return;
    this.http.get<{ id: number; name: string; meter: string; type: string; goal: number; equipment: string }[]>(
      `/api/client/${this.user.id}/circuits`
    ).subscribe({
      next: persisted => {
        if (!this.dashboard) return;
        const mapped = persisted.map(circuit => ({
          id: circuit.id,
          name: circuit.name,
          consumption: 0,
          share: 0,
          trend: 'Nouveau',
          goal: circuit.goal,
          equipment: circuit.equipment ? circuit.equipment.split(',').map(item => item.trim()).filter(Boolean) : ['Aucun équipement déclaré']
        }));
        this.dashboard = { ...this.dashboard, circuits: mapped };
      }
    });
  }

  private applySavedCircuit(circuit: { id: number; name: string; meter: string; type: string; goal: number; equipment: string }): void {
    if (!this.dashboard) return;
    const saved = {
      id: circuit.id,
      name: circuit.name,
      consumption: 0,
      share: 0,
      trend: 'Nouveau',
      goal: circuit.goal,
      equipment: circuit.equipment ? circuit.equipment.split(',').map(item => item.trim()).filter(Boolean) : ['Aucun équipement déclaré']
    };
    const circuits = this.editingCircuitId
      ? this.dashboard.circuits.map(item => item.id === circuit.id ? saved : item)
      : [...this.dashboard.circuits, saved];
    this.dashboard = { ...this.dashboard, circuits };
    this.circuitMessage = this.editingCircuitId ? 'Circuit modifié avec succès.' : 'Circuit ajouté avec succès.';
    setTimeout(() => this.closeCircuitModal(), 700);
  }

  logout(): void {
    localStorage.removeItem('tricity-user');
    this.profileOpen = false;
    this.router.navigate(['/connexion']);
  }

  private getFallbackDashboard(): ClientDashboard {
    return {
      greeting: this.user?.name || 'Client',
      todayConsumption: 18,
      dailyGoal: 30,
      cycleConsumption: 412,
      cycleGoal: 620,
      progress: 66,
      hourly: [8, 12, 14, 18, 24, 31, 38, 42, 48, 45, 50, 57, 61, 58, 64, 70, 67, 74, 80, 72, 65, 53, 38, 21],
      circuits: [
        { name: 'Éclairage', consumption: 112, share: 27, trend: '-4,2%', goal: 120, equipment: ['Éclairage intérieur', 'Éclairage extérieur'] },
        { name: 'Prises', consumption: 164, share: 40, trend: '+2,1%', goal: 150, equipment: ['Réfrigérateur', 'Télévision', 'Lave-linge'] },
        { name: 'Climatisation', consumption: 86, share: 21, trend: '-8,7%', goal: 100, equipment: ['Climatiseur salon', 'Climatiseur chambre'] },
        { name: 'Autres', consumption: 50, share: 12, trend: '+0,4%', goal: 60, equipment: ['Autres appareils'] }
      ],
      alerts: ['Votre consommation est dans l\'objectif journalier', 'Le cycle STEG est à 66% de son objectif']
    };
  }
}
