import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <main class="auth-shell"><a class="back" routerLink="/">← Retour au site</a><section class="auth-card card"><a class="tricity-logo" routerLink="/"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span><span>Tricity</span></a><p class="eyebrow">ESPACE SÉCURISÉ</p><h1>Bon retour.</h1><p class="hint">Accédez à vos données et à vos objectifs d'énergie.</p><form (ngSubmit)="login()"><label>Email<input name="email" type="email" [(ngModel)]="email" required></label><label>Mot de passe<div class="password-row"><input name="password" type="password" [(ngModel)]="password" required><button type="button" (click)="openForgotPassword()">Mot de passe oublié ?</button></div></label>@if(error){<div class="error">{{error}}</div>}<button class="btn" type="submit">Ouvrir mon espace →</button></form><div class="demo-accounts"><span>Accès de démonstration</span><button class="demo-link" type="button" (click)="useDemoCredentials('admin@admin.com', 'mdp admin')">Admin</button><button class="demo-link" type="button" (click)="useDemoCredentials('client-test@gmail.com', '12345678')">Client</button><button class="demo-link" type="button" (click)="useDemoCredentials('Installer-test@gmail.com', '12345678')">Installateur</button></div><p class="request-link">Pas encore de compte ? <a routerLink="/" fragment="demande">Demander un accès</a></p></section>
  @if(forgotOpen) {<div class="forgot-backdrop" (mousedown)="closeForgotPassword()"><section class="forgot-modal card" role="dialog" aria-modal="true" (mousedown)="$event.stopPropagation()"><button class="forgot-close" type="button" (click)="closeForgotPassword()" aria-label="Fermer">×</button><p class="eyebrow">RÉINITIALISATION</p><h2>Mot de passe oublié</h2><p class="forgot-hint">Saisissez votre adresse email professionnelle. Un nouveau mot de passe temporaire sera envoyé.</p><form (ngSubmit)="sendReset()"><label>Adresse e-mail<input name="resetEmail" type="email" [(ngModel)]="resetEmail" required></label>@if(resetMessage){<div [class]="resetError ? 'error' : 'success'">{{resetMessage}}</div>}<button class="btn" type="submit" [disabled]="resetLoading">{{resetLoading ? 'Envoi en cours...' : 'Envoyer le nouveau mot de passe'}}</button></form></section></div>}
  </main>`,
  styles: [`.auth-shell{min-height:100vh;padding:28px;display:grid;place-items:center;position:relative}.back{position:absolute;top:28px;left:28px;color:var(--muted);text-decoration:none;font-weight:600}.auth-card{width:min(480px,100%);padding:40px}.auth-card h1{font-size:2.7rem;margin:10px 0}.hint{color:var(--muted);margin:0 0 28px}.auth-card form{display:grid;gap:18px}.auth-card label{display:grid;gap:7px;font-size:.86rem;font-weight:700}.auth-card input{border:1px solid var(--line);border-radius:10px;padding:13px;font:inherit}.password-row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px}.password-row input{width:100%}.password-row button{border:0;background:none;color:var(--brand);font-size:.78rem;font-weight:700;cursor:pointer}.auth-card .btn{width:100%;margin-top:5px}.demo-accounts{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px 16px;margin-top:22px}.demo-accounts>span{width:100%;text-align:center;color:var(--muted);font-size:.8rem}.demo-link{border:0;background:none;color:var(--muted);padding:4px 0;text-align:center;text-decoration:underline;text-underline-offset:3px;cursor:pointer;font:inherit;font-size:.85rem}.request-link{text-align:center;color:var(--muted);font-size:.85rem}.request-link a{color:var(--brand);font-weight:700}.error{color:#b43e43;background:#fff0f0;border-radius:8px;padding:10px;font-size:.9rem}.success{color:var(--green);background:#edf8f2;border:1px solid #d5ebde;border-radius:8px;padding:10px;font-size:.9rem}.forgot-backdrop{position:fixed;inset:0;background:rgba(28,25,39,.48);backdrop-filter:blur(4px);display:grid;place-items:center;padding:20px;z-index:100}.forgot-modal{position:relative;width:min(460px,100%);padding:32px}.forgot-modal h2{font-size:1.85rem;margin:8px 0}.forgot-hint{color:var(--muted);font-size:.88rem;margin:8px 0 18px}.forgot-modal form{display:grid;gap:14px}.forgot-modal label{display:grid;gap:6px;font-size:.82rem;font-weight:700}.forgot-modal input{border:1px solid var(--line);border-radius:8px;padding:12px;font:inherit}.forgot-modal .btn{width:100%}.forgot-modal .btn:disabled{opacity:.65;cursor:wait}.forgot-close{position:absolute;right:16px;top:12px;border:0;background:white;font-size:1.4rem;cursor:pointer}`]
})
export class AuthComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = ''; password = ''; error = '';
  forgotOpen = false;
  resetEmail = '';
  resetMessage = '';
  resetError = false;
  resetLoading = false;
  useDemoCredentials(email: string, password: string): void { this.email = email; this.password = password; this.error = ''; }
  login(): void { this.error = ''; this.auth.login(this.email, this.password).subscribe({ next: (user) => { this.auth.saveUser(user); const destination = user.role === 'ADMIN' ? '/admin' : user.role === 'INSTALLER' ? '/installateur' : '/client'; this.router.navigateByUrl(destination); }, error: () => this.error = 'Email ou mot de passe incorrect.' }); }
  openForgotPassword(): void {
    this.resetEmail = this.email;
    this.resetMessage = '';
    this.resetError = false;
    this.forgotOpen = true;
  }
  closeForgotPassword(): void {
    this.forgotOpen = false;
    this.resetMessage = '';
    this.resetError = false;
  }
  sendReset(): void {
    this.resetLoading = true;
    this.resetMessage = '';
    this.resetError = false;
    this.auth.resetPassword(this.resetEmail).subscribe({
      next: () => {
        this.resetLoading = false;
        this.resetMessage = `Un mot de passe temporaire a été envoyé à ${this.resetEmail}.`;
      },
      error: (response) => {
        this.resetLoading = false;
        this.resetError = true;
        this.resetMessage = response.status === 404
          ? 'Aucun compte Tricity n’est associé à cette adresse email.'
          : response.status === 503
            ? 'Le service email est indisponible. Réessayez plus tard.'
            : 'Impossible d’envoyer l’email pour le moment.';
      }
    });
  }
}
