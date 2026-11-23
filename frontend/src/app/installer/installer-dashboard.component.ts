import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

type InstallerSection = 'dashboard' | 'installations' | 'interventions' | 'clients' | 'notifications' | 'profile';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="installer-layout">
    <aside class="sidebar">
      <a class="tricity-logo" routerLink="/"><span class="logo-mark"><svg viewBox="0 0 24 24"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span><span>Tricity</span></a>
      <div class="technician-card"><span class="avatar">{{initials}}</span><div><b>{{user?.name || 'Technicien'}}</b><small>Installateur</small></div></div>
      <nav>
        <button [class.active]="section==='dashboard'" (click)="section='dashboard'" type="button">Tableau de bord</button>
        <button [class.active]="section==='installations'" (click)="section='installations'" type="button">Installations</button>
        <button [class.active]="section==='interventions'" (click)="section='interventions'" type="button">Interventions SAV</button>
        <button [class.active]="section==='clients'" (click)="section='clients'" type="button">Mes clients</button>
        <button [class.active]="section==='notifications'" (click)="section='notifications'" type="button">Notifications <b>{{unread}}</b></button>
      </nav>
      <button class="logout" type="button" (click)="logout()">Se déconnecter</button>
    </aside>

    <main>
      <header class="topbar">
        <div><p class="eyebrow">ESPACE TERRAIN</p><h1>{{pageTitle}}</h1></div>
        <div class="topbar-actions">
          <button class="notification" type="button" (click)="toggleNotifications()" [attr.aria-expanded]="notificationsOpen">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><b>{{unread}}</b>
          </button>
          @if(notificationsOpen) {
            <div class="notification-popover">
              <div class="notification-head"><div><p class="eyebrow">ACTUALITÉS</p><b>Notifications</b></div><button type="button" (click)="unread=0">Tout lire</button></div>
              <button class="notification-item" type="button" (click)="openNotification('Compteur hors ligne')"><i class="red"></i><span><b>Compteur hors ligne</b><small>Villa Ben Arous — aucune mesure depuis 42 minutes.</small><time>Il y a 42 min</time></span></button>
              <button class="notification-item" type="button" (click)="openNotification('Intervention à confirmer')"><i class="orange"></i><span><b>Intervention à confirmer</b><small>Agence La Marsa — visite prévue à 14:30.</small><time>Il y a 2 h</time></span></button>
              <button class="notification-all" type="button" (click)="section='notifications'; notificationsOpen=false">Voir toutes les notifications →</button>
            </div>
          }
          <button class="profile" type="button" (click)="toggleProfile()" [attr.aria-expanded]="profileOpen"><span class="avatar">{{initials}}</span><span>{{user?.name || 'Technicien'}}<small>Installateur</small></span><b class="chevron">⌄</b></button>
          @if(profileOpen) {
            <div class="profile-popover">
              <div class="profile-head"><span class="avatar large">{{initials}}</span><div><b>{{user?.name || 'Technicien'}}</b><small>{{user?.email || 'installateur@tricity.tn'}}</small></div></div>
              <div class="profile-info">
                <div><span>Rôle</span><b>Installateur / Technicien</b></div>
                <div><span>Téléphone</span><b>{{user?.phone || 'Non renseigné'}}</b></div>
                <div><span>Zone d'intervention</span><b>{{user?.governorate || 'Grand Tunis'}}</b></div>
                <div><span>Spécialité</span><b>{{user?.meterType || 'Mono & Triphasé'}}</b></div>
              </div>
              <button class="password-link" type="button" (click)="openProfile()">Voir mes informations</button>
            </div>
          }
        </div>
      </header>

      @if(section==='dashboard') {
        <section class="welcome"><div><p>Bonjour, <b>{{firstName}}</b></p><span>Voici l'état opérationnel de vos interventions.</span></div><button class="btn lime" type="button" (click)="openVisitModal()">+ Nouvelle intervention</button></section>
        <section class="stats">
          <article><span>Interventions aujourd'hui</span><strong>3</strong><small>2 terminées · 1 en cours</small></article>
          <article><span>Installations actives</span><strong>48</strong><small>Sur 7 gouvernorats</small></article>
          <article><span>Alertes compteurs</span><strong class="orange">5</strong><small>3 hors ligne · 2 à vérifier</small></article>
          <article><span>Taux de réussite</span><strong>96%</strong><small>30 derniers jours</small></article>
        </section>
        <section class="dashboard-grid">
          <article class="panel"><div class="panel-head"><div><p class="eyebrow">AUJOURD'HUI</p><h2>Programme du jour</h2></div><button class="text-button" type="button" (click)="section='interventions'">Voir tout</button></div>
            <div class="timeline">
              @for(visit of todayVisits; track visit.time) {<div class="visit"><time>{{visit.time}}</time><span class="visit-line" [class.done]="visit.status==='Terminée'" [class.progress]="visit.status==='En cours'"></span><div><b>{{visit.client}}</b><p>{{visit.address}}</p><small>{{visit.type}}</small></div><em [class.done]="visit.status==='Terminée'" [class.progress]="visit.status==='En cours'">{{visit.status}}</em></div>}
            </div>
          </article>
          <article class="panel"><p class="eyebrow">ÉTAT DU PARC</p><h2>Compteurs assignés</h2><div class="meter-ring"><div><b>48</b><small>actifs</small></div></div><div class="meter-legend"><span><i class="online"></i>En ligne <b>43</b></span><span><i class="offline"></i>Hors ligne <b>3</b></span><span><i class="warning"></i>À vérifier <b>2</b></span></div></article>
        </section>
      }

      @if(section==='installations') {
        <section class="panel"><div class="panel-head"><div><p class="eyebrow">CONFIGURATION TECHNIQUE</p><h2>Mes installations</h2></div><button class="btn lime" type="button" (click)="openVisitModal()">Nouvelle installation</button></div>
          <div class="filters"><input [(ngModel)]="search" placeholder="Rechercher client, compteur, adresse..."><select [(ngModel)]="meterFilter"><option value="">Tous les compteurs</option><option>Monophasé</option><option>Triphasé</option></select></div>
          <div class="installation-list">
            @for(site of filteredSites; track site.id) {<article><span class="meter-icon">{{site.meter==='Triphasé'?'3Ø':'1Ø'}}</span><div><b>{{site.client}}</b><p>{{site.address}}</p><small>{{site.serial}} · {{site.meter}}</small></div><div class="signals"><span [class.ok]="site.status==='En ligne'" [class.attention]="site.status!='En ligne'">{{site.status}}</span><b>{{site.circuits}} circuits</b></div><button type="button" (click)="selectedSite=site">Ouvrir la fiche</button></article>}
          </div>
        </section>
      }

      @if(section==='interventions') {
        <section class="panel"><div class="panel-head"><div><p class="eyebrow">ASSISTANCE TECHNIQUE</p><h2>Interventions SAV</h2></div><button class="btn lime" type="button" (click)="openVisitModal()">Créer une intervention</button></div>
          <div class="intervention-table"><div class="table-header"><span>CLIENT</span><span>PROBLÈME</span><span>PRIORITÉ</span><span>STATUT</span><span></span></div>@for(ticket of tickets; track ticket.id){<div class="ticket"><b>{{ticket.client}}</b><span>{{ticket.issue}}</span><em [class.high]="ticket.priority==='Urgente'">{{ticket.priority}}</em><span>{{ticket.status}}</span><button type="button" (click)="ticket.status='Planifiée'">Planifier</button></div>}</div>
        </section>
      }

      @if(section==='clients') {
        <section class="panel"><div class="panel-head"><div><p class="eyebrow">PORTFOLIO</p><h2>Clients et sites</h2></div><span class="count">48 installations</span></div>
          <div class="client-cards">@for(site of sites; track site.id){<article><div class="client-avatar">{{site.client.charAt(0)}}</div><div><b>{{site.client}}</b><p>{{site.address}}</p><small>{{site.meter}} · {{site.circuits}} circuits</small></div><button type="button" (click)="selectedSite=site">Voir la fiche</button></article>}</div>
        </section>
      }

      @if(section==='notifications') {
        <section class="panel"><div class="panel-head"><div><p class="eyebrow">ACTUALITÉS</p><h2>Notifications</h2></div><button class="text-button" type="button">Tout marquer comme lu</button></div>
          <div class="notifications"><article><i class="red"></i><div><b>Compteur hors ligne</b><p>Villa Ben Arous — aucune mesure depuis 42 minutes.</p><small>Il y a 42 min</small></div></article><article><i class="orange"></i><div><b>Intervention à confirmer</b><p>Agence La Marsa — visite prévue à 14:30.</p><small>Il y a 2 h</small></div></article></div>
        </section>
      }

      @if(section==='profile') {
        <section class="installer-profile">
          <article class="panel profile-cover-card">
            <div class="profile-cover"></div>
            <div class="profile-identity">
              <span class="avatar profile-avatar">{{initials}}</span>
              <div><p class="eyebrow">COMPTE INSTALLATEUR</p><h2>{{user?.name || 'Technicien Tricity'}}</h2><p>{{user?.email || 'installateur@tricity.tn'}}</p></div>
              <span class="account-status">Compte actif</span>
            </div>
          </article>

          <div class="profile-columns">
            <article class="panel profile-details">
              <div class="panel-head"><div><p class="eyebrow">INFORMATION PROFESSIONNELLE</p><h2>Mes informations</h2></div></div>
              <div class="detail-grid profile-detail-grid">
                <div><span>Nom complet</span><b>{{user?.name || 'Technicien Tricity'}}</b></div>
                <div><span>Adresse e-mail</span><b>{{user?.email || 'installateur@tricity.tn'}}</b></div>
                <div><span>Rôle</span><b>Installateur / Technicien</b></div>
                <div><span>Téléphone</span><b>{{user?.phone || 'Non renseigné'}}</b></div>
                <div><span>Zone d'intervention</span><b>{{user?.governorate || 'Grand Tunis'}}</b></div>
                <div><span>Ville principale</span><b>{{user?.city || 'Tunis'}}</b></div>
                <div><span>Spécialité</span><b>{{user?.meterType || 'Mono & Triphasé'}}</b></div>
                <div><span>Statut professionnel</span><b>Disponible</b></div>
              </div>
            </article>

            <article class="panel password-card">
              <p class="eyebrow">SÉCURITÉ</p>
              <h2>Mot de passe</h2>
              <p class="security-note">Vous pouvez mettre à jour votre mot de passe. Les informations professionnelles sont gérées par le back-office.</p>
              <form class="password-form" (ngSubmit)="changePassword()">
                <label>Mot de passe actuel<input type="password" [(ngModel)]="passwordCurrent" name="profilePasswordCurrent" required></label>
                <label>Nouveau mot de passe<input type="password" [(ngModel)]="passwordNew" name="profilePasswordNew" minlength="8" required></label>
                <label>Confirmation du nouveau mot de passe<input type="password" [(ngModel)]="passwordConfirm" name="profilePasswordConfirm" required></label>
                @if(passwordMessage){<p [class.error]="passwordError">{{passwordMessage}}</p>}
                <button class="btn" type="submit">Modifier le mot de passe</button>
              </form>
            </article>
          </div>
        </section>
      }
    </main>

    @if(selectedSite) {
      <div class="modal-backdrop" (click)="selectedSite=null"><section class="modal" (click)="$event.stopPropagation()"><button class="close" type="button" (click)="selectedSite=null">×</button><p class="eyebrow">FICHE INSTALLATION</p><h2>{{selectedSite.client}}</h2><div class="detail-grid"><div><small>Adresse</small><b>{{selectedSite.address}}</b></div><div><small>Compteur</small><b>{{selectedSite.meter}}</b></div><div><small>Série</small><b>{{selectedSite.serial}}</b></div><div><small>Circuits</small><b>{{selectedSite.circuits}} / {{selectedSite.meter==='Triphasé'?8:4}}</b></div></div><div class="equipment"><b>Circuits configurés</b><span>Éclairage</span><span>Prises</span><span>Climatisation</span><span>{{selectedSite.meter==='Triphasé'?'Harmoniques / 3 phases':'Autres — calculé'}}</span></div><div class="modal-actions"><button class="btn outline" type="button" (click)="selectedSite=null">Fermer</button><button class="btn lime" type="button" (click)="selectedSite=null; openVisitModal()">Planifier une intervention</button></div></section></div>
    }

    @if(visitModal) {
      <div class="modal-backdrop" (click)="visitModal=false"><section class="modal" (click)="$event.stopPropagation()"><button class="close" type="button" (click)="visitModal=false">×</button><p class="eyebrow">NOUVELLE VISITE</p><h2>Planifier une intervention</h2><form class="visit-form" (ngSubmit)="saveVisit()"><label>Client ou site<input [(ngModel)]="visitForm.client" name="visitClient" required></label><label>Date<input type="date" [(ngModel)]="visitForm.date" name="visitDate" required></label><label>Heure<input type="time" [(ngModel)]="visitForm.time" name="visitTime" required></label><label>Type d'intervention<select [(ngModel)]="visitForm.type" name="visitType"><option>Installation</option><option>Configuration circuits</option><option>Maintenance</option><option>Dépannage SAV</option></select></label><label class="full">Adresse / commentaires<input [(ngModel)]="visitForm.address" name="visitAddress" required></label><div class="modal-actions"><button class="btn outline" type="button" (click)="visitModal=false">Annuler</button><button class="btn lime" type="submit">Planifier</button></div></form></section></div>
    }
  </div>
  `,
  styles: [`
  :host{display:block}.installer-layout{min-height:100vh;display:grid;grid-template-columns:250px 1fr;background:#f6f7fb}.sidebar{height:100vh;position:sticky;top:0;background:white;border-right:1px solid var(--line);padding:24px 18px;display:flex;flex-direction:column}.technician-card{display:flex;align-items:center;gap:10px;margin:36px 4px 24px}.technician-card small,.profile small{display:block;color:var(--muted)}.avatar{width:38px;height:38px;border-radius:50%;background:var(--lime);color:var(--brand);display:grid;place-items:center;font-weight:800}.sidebar nav{display:grid;gap:5px}.sidebar nav button{border:0;background:transparent;text-align:left;border-radius:9px;padding:12px;color:#73788a;font-weight:700;cursor:pointer}.sidebar nav button.active{background:#f0edf7;color:var(--brand)}.sidebar nav button b{float:right;background:var(--red);color:white;border-radius:50%;width:19px;height:19px;text-align:center;font-size:.65rem;line-height:19px}.logout{margin-top:auto;border:0;border-top:1px solid var(--line);background:white;color:var(--red);padding:16px 4px 4px;font-weight:700;cursor:pointer}main{padding:28px 38px 50px}.topbar{height:74px;display:flex;justify-content:space-between}.topbar h1{font-size:1.85rem;margin-top:5px}.topbar-actions{display:flex;align-items:center;gap:10px;position:relative}.notification,.profile{border:1px solid var(--line);background:white;cursor:pointer}.notification{width:42px;height:42px;border-radius:50%;position:relative;display:grid;place-items:center}.notification svg{width:19px;height:19px;fill:none;stroke:var(--brand);stroke-width:1.8}.notification b{position:absolute;right:-3px;top:-5px;width:17px;height:17px;border-radius:50%;background:var(--red);color:white;font-size:.65rem;display:grid;place-items:center}.profile{height:46px;border-radius:24px;padding:3px 12px 3px 3px;display:flex;align-items:center;gap:8px}.profile>span:last-child{text-align:left;font-weight:700}.profile .chevron{color:var(--muted)}.notification-popover,.profile-popover{position:absolute;top:52px;right:0;width:390px;background:white;border:1px solid var(--line);border-radius:14px;box-shadow:0 18px 45px rgba(31,27,49,.16);z-index:40}.notification-popover{right:58px;width:390px;padding:0;overflow:hidden}.notification-head{display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--line)}.notification-head p{margin:0}.notification-head button{border:0;background:none;color:var(--brand);font-weight:700;cursor:pointer}.notification-item{width:100%;border:0;border-bottom:1px solid #eff1f5;background:white;padding:13px 16px;display:flex;gap:11px;text-align:left;cursor:pointer}.notification-item i{width:9px;height:9px;border-radius:50%;margin-top:5px}.notification-item span{display:grid}.notification-item small{color:var(--muted);margin:2px 0}.notification-item time{color:#a0a4b1;font-size:.68rem}.notification-all{width:100%;border:0;background:#fafbfc;padding:12px;color:var(--brand);font-weight:700;cursor:pointer}.profile-popover{width:330px;padding:16px}.profile-head{display:flex;align-items:center;gap:11px;padding-bottom:14px;border-bottom:1px solid var(--line)}.avatar.large{width:46px;height:46px}.profile-head b,.profile-head small{display:block}.profile-head small{color:var(--muted)}.profile-info{display:grid;gap:8px;padding:13px 0}.profile-info div{display:flex;justify-content:space-between;gap:12px;font-size:.78rem}.profile-info span{color:var(--muted)}.profile-info b{text-align:right}.password-link{width:100%;border:1px solid var(--line);background:#fafbfc;border-radius:8px;padding:9px;color:var(--brand);font-weight:700;cursor:pointer}.password-form{display:grid;gap:8px;margin-top:10px}.password-form label{display:grid;gap:4px;font-size:.72rem;font-weight:700}.password-form input{border:1px solid var(--line);border-radius:7px;padding:9px}.password-form p{color:var(--green);font-size:.75rem;margin:0}.password-form p.error{color:var(--red)}.btn.small{padding:7px 10px}.profile-logout{width:100%;border:0;border-top:1px solid var(--line);margin-top:12px;padding:12px 2px 2px;background:white;color:var(--red);font-weight:700;cursor:pointer}.welcome{display:flex;justify-content:space-between;align-items:center;margin:10px 0 22px}.welcome p{font:600 1.75rem "Space Grotesk";margin:0}.welcome span{color:var(--muted)}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stats article,.panel{background:white;border:1px solid var(--line);border-radius:14px}.stats article{padding:18px}.stats article span{color:var(--muted);font-size:.78rem}.stats article strong{display:block;font:700 2.1rem "Space Grotesk";margin:8px 0}.stats article strong.orange{color:var(--orange)}.stats article small{color:var(--muted)}.dashboard-grid{display:grid;grid-template-columns:1.65fr .75fr;gap:14px;margin-top:14px}.panel{padding:22px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start}.panel h2{font-size:1.5rem;margin-top:6px}.text-button{border:0;background:none;color:var(--brand);font-weight:700;cursor:pointer}.timeline{margin-top:18px}.visit{display:grid;grid-template-columns:45px 12px 1fr auto;gap:10px;align-items:start;padding:10px 0}.visit time{font-weight:800;font-size:.78rem}.visit-line{width:8px;height:8px;border-radius:50%;background:#b9bfca;margin-top:4px}.visit-line.done{background:var(--green)}.visit-line.progress{background:var(--orange)}.visit p{margin:2px 0;color:var(--muted);font-size:.78rem}.visit small{color:var(--muted)}.visit em{font-style:normal;font-size:.68rem;border-radius:20px;background:#edf7ef;color:var(--green);padding:5px 8px}.visit em.progress{background:#fff2e8;color:var(--orange)}.meter-ring{width:150px;height:150px;border-radius:50%;background:conic-gradient(var(--lime) 0 90%,var(--orange) 90% 94%,#edf0f4 94%);display:grid;place-items:center;margin:18px auto}.meter-ring:before{content:"";grid-area:1/1;width:115px;height:115px;border-radius:50%;background:white}.meter-ring div{grid-area:1/1;z-index:1;text-align:center}.meter-ring b,.meter-ring small{display:block}.meter-ring b{font:700 1.8rem "Space Grotesk"}.meter-legend{display:grid;gap:7px}.meter-legend span{display:flex;align-items:center}.meter-legend i{width:8px;height:8px;border-radius:50%;margin-right:7px}.meter-legend b{margin-left:auto}.online{background:var(--green)}.offline{background:var(--red)}.warning{background:var(--orange)}.filters{display:flex;gap:10px;margin:18px 0}.filters input,.filters select{border:1px solid var(--line);border-radius:8px;padding:10px;background:white}.filters input{flex:1}.installation-list{display:grid;gap:8px}.installation-list article{display:grid;grid-template-columns:44px 1.5fr 1fr auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:12px}.meter-icon{width:44px;height:44px;border-radius:10px;background:var(--lime);display:grid;place-items:center;color:var(--brand);font-weight:800}.installation-list p,.installation-list small{display:block;margin:2px 0;color:var(--muted)}.signals span,.signals b{display:block}.signals span{font-size:.75rem}.signals span.ok{color:var(--green)}.signals span.attention{color:var(--red)}.installation-list button,.ticket button,.client-cards button{border:1px solid var(--line);background:white;border-radius:8px;padding:8px;color:var(--brand);font-weight:700;cursor:pointer}.count{color:var(--muted)}.intervention-table{margin-top:18px}.table-header,.ticket{display:grid;grid-template-columns:1.2fr 1.8fr .7fr .7fr auto;gap:10px;align-items:center}.table-header{color:var(--muted);font-size:.68rem;padding:8px}.ticket{border-top:1px solid var(--line);padding:14px 8px}.ticket em{font-style:normal;color:var(--green)}.ticket em.high{color:var(--red)}.client-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.client-cards article{display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:12px}.client-avatar{width:42px;height:42px;border-radius:50%;background:var(--lime);display:grid;place-items:center;font-weight:800}.client-cards p,.client-cards small{display:block;color:var(--muted);margin:2px 0}.notifications article{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--line)}.notifications i{width:9px;height:9px;border-radius:50%;margin-top:5px}.notifications i.red{background:var(--red)}.notifications i.orange{background:var(--orange)}.notifications p{margin:3px 0;color:var(--muted)}.notifications small{color:var(--muted)}.modal-backdrop{position:fixed;inset:0;background:rgba(28,25,39,.48);display:grid;place-items:center;z-index:50;padding:20px}.modal{position:relative;width:min(680px,100%);background:white;border-radius:16px;padding:28px}.modal h2{font-size:1.7rem;margin:8px 0}.close{position:absolute;right:16px;top:12px;border:0;background:white;font-size:1.4rem;cursor:pointer}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.detail-grid div{border:1px solid var(--line);border-radius:9px;padding:11px}.detail-grid small,.detail-grid b{display:block}.detail-grid small{color:var(--muted)}.equipment{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.equipment b{width:100%}.equipment span{border-radius:20px;background:#f0edf7;padding:7px 10px;font-size:.75rem}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.visit-form{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:18px}.visit-form label{display:grid;gap:5px;font-size:.75rem;font-weight:700}.visit-form input,.visit-form select{border:1px solid var(--line);border-radius:8px;padding:10px}.visit-form .full{grid-column:1/-1}.visit-form .modal-actions{grid-column:1/-1}@media(max-width:1000px){.installer-layout{grid-template-columns:200px 1fr}.stats{grid-template-columns:1fr 1fr}.dashboard-grid{grid-template-columns:1fr}.client-cards{grid-template-columns:1fr}}@media(max-width:760px){.installer-layout{grid-template-columns:1fr}.sidebar{height:auto;position:relative}.sidebar nav{display:flex;overflow:auto}.sidebar nav button{white-space:nowrap}.technician-card,.logout{display:none}main{padding:18px}.topbar{height:64px}.profile>span:last-child{display:none}.notification-popover{right:-50px;width:calc(100vw - 36px)}.profile-popover{width:min(330px,calc(100vw - 36px));right:0}.stats{grid-template-columns:1fr}.installation-list article{grid-template-columns:44px 1fr}.signals{display:none}.installation-list button{grid-column:2}.table-header{display:none}.ticket{grid-template-columns:1fr}.visit-form{grid-template-columns:1fr}.visit-form .full,.visit-form .modal-actions{grid-column:auto}.welcome{align-items:flex-start;gap:12px}.welcome .btn{padding:9px}}
  .installer-profile{display:grid;gap:16px}.profile-cover-card{padding:0;overflow:hidden}.profile-cover{height:110px;background:linear-gradient(120deg,var(--brand) 0%,#60478d 60%,var(--lime) 160%)}.profile-identity{min-height:92px;padding:12px 22px 16px 110px;position:relative;display:flex;align-items:center}.profile-avatar{position:absolute!important;left:22px;top:-38px;width:76px!important;height:76px!important;border:5px solid white;font-size:1.45rem}.profile-identity h2{font-size:1.55rem;margin:3px 0}.profile-identity p{margin:0;color:var(--muted)}.account-status{margin-left:auto;color:var(--green);background:#edf7ef;border-radius:20px;padding:7px 11px;font-size:.75rem;font-weight:700}.profile-columns{display:grid;grid-template-columns:1.55fr .75fr;gap:16px}.profile-detail-grid{grid-template-columns:1fr 1fr!important}.profile-detail-grid div{border:1px solid var(--line);border-radius:9px;padding:12px}.profile-detail-grid span,.profile-detail-grid b{display:block}.profile-detail-grid span{color:var(--muted);font-size:.72rem}.security-note{color:var(--muted);font-size:.78rem}.password-card h2{font-size:1.55rem;margin:6px 0}.password-card .btn{margin-top:8px}@media(max-width:1000px){.profile-columns{grid-template-columns:1fr}}@media(max-width:520px){.profile-identity{padding:48px 16px 16px}.profile-avatar{left:16px}.profile-detail-grid{grid-template-columns:1fr!important}.account-status{display:none}}
  `]
})
export class InstallerDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  readonly user = this.auth.currentUser();
  section: InstallerSection = 'dashboard';
  search = '';
  meterFilter = '';
  selectedSite: any = null;
  visitModal = false;
  visitForm = { client: '', date: '', time: '', type: 'Maintenance', address: '' };
  profileOpen = false;
  notificationsOpen = false;
  showPasswordForm = false;
  unread = 4;
  passwordCurrent = '';
  passwordNew = '';
  passwordConfirm = '';
  passwordMessage = '';
  passwordError = false;

  constructor() {
    this.section = new URL(window.location.href).searchParams.get('view') === 'profil' ? 'profile' : 'dashboard';
  }

  todayVisits = [
    { time:'09:00', client:'Villa Ben Youssef', address:'La Marsa, Tunis', type:'Installation monophasée', status:'Terminée' },
    { time:'11:30', client:'Agence Centrale', address:'Les Berges du Lac', type:'Configuration triphasée', status:'En cours' },
    { time:'14:30', client:'Salon Thé El Medina', address:'Medina, Tunis', status:'À venir', type:'Dépannage SAV' }
  ];
  tickets = [
    { id:1, client:'Agence La Marsa', issue:'Compteur hors ligne', priority:'Urgente', status:'À planifier' },
    { id:2, client:'Villa Sahloul', issue:'Mesure d\'un circuit instable', priority:'Élevée', status:'Planifiée' },
    { id:3, client:'Pâtisserie Mornag', issue:'Reconfiguration des disjoncteurs', priority:'Normale', status:'Ouverte' }
  ];
  sites = [
    { id:1, client:'Villa Ben Youssef', address:'La Marsa, Tunis', serial:'TRI-10482', meter:'Monophasé', circuits:4, status:'En ligne' },
    { id:2, client:'Agence Centrale', address:'Les Berges du Lac, Tunis', serial:'TRI-20819', meter:'Triphasé', circuits:6, status:'En ligne' },
    { id:3, client:'Salon Thé El Medina', address:'Medina, Tunis', serial:'TRI-30744', meter:'Triphasé', circuits:4, status:'À vérifier' },
    { id:4, client:'Pâtisserie Mornag', address:'Mornag, Ben Arous', serial:'TRI-42106', meter:'Triphasé', circuits:7, status:'Hors ligne' }
  ];

  get initials(): string { return (this.user?.name || 'T').split(/\s+/).slice(0,2).map(v=>v[0]).join('').toUpperCase(); }
  get firstName(): string { return (this.user?.name || 'Technicien').split(' ')[0]; }
  get pageTitle(): string { return {dashboard:'Tableau de bord',installations:'Installations',interventions:'Interventions SAV',clients:'Mes clients',notifications:'Notifications',profile:'Mon profil'}[this.section]; }
  get filteredSites(): any[] { return this.sites.filter(site => (!this.meterFilter || site.meter===this.meterFilter) && (!this.search || `${site.client} ${site.address} ${site.serial}`.toLowerCase().includes(this.search.toLowerCase()))); }
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
    this.router.navigate(['/installateur'], { queryParams: { view: 'profil' } });
  }
  openNotification(title: string): void {
    this.notificationsOpen = false;
    this.unread = Math.max(0, this.unread - 1);
    this.section = 'notifications';
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
    this.http.put<{id:number;email:string}>(
      `/api/auth/users/${this.user.id}/password`,
      { currentPassword: this.passwordCurrent, newPassword: this.passwordNew }
    ).subscribe({
      next: updated => {
        this.passwordMessage = `Mot de passe modifié. Une confirmation a été envoyée à ${updated.email || this.user?.email}.`;
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
  openVisitModal(): void { this.visitModal=true; }
  saveVisit(): void { this.visitModal=false; this.visitForm={client:'',date:'',time:'',type:'Maintenance',address:''}; }
  logout(): void { localStorage.removeItem('tricity-user'); this.router.navigate(['/connexion']); }
}
