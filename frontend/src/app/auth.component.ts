import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <main class="auth-shell"><a class="back" routerLink="/">← Retour au site</a><section class="auth-card card"><a class="tricity-logo" routerLink="/"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5 13h5l-1 9 8.5-12h-5z"/></svg></span><span>Tricity</span></a><p class="eyebrow">ESPACE SÉCURISÉ</p><h1>Bon retour.</h1><p class="hint">Accédez à vos données et à vos objectifs d'énergie.</p><form (ngSubmit)="login()"><label>Email<input name="email" type="email" [(ngModel)]="email" required></label><label>Mot de passe<input name="password" type="password" [(ngModel)]="password" required></label>@if(error){<div class="error">{{error}}</div>}<button class="btn" type="submit">Ouvrir mon espace →</button></form><button class="demo-link" type="button" (click)="useDemoCredentials()">Démo back-office : admin@admin.com · mdp admin</button><p class="request-link">Pas encore de compte ? <a routerLink="/" fragment="demande">Demander un accès</a></p></section></main>`,
  styles: [`.auth-shell{min-height:100vh;padding:28px;display:grid;place-items:center;position:relative}.back{position:absolute;top:28px;left:28px;color:var(--muted);text-decoration:none;font-weight:600}.auth-card{width:min(480px,100%);padding:40px}.auth-card h1{font-size:2.7rem;margin:10px 0}.hint{color:var(--muted);margin:0 0 28px}.auth-card form{display:grid;gap:18px}.auth-card label{display:grid;gap:7px;font-size:.86rem;font-weight:700}.auth-card input{border:1px solid var(--line);border-radius:10px;padding:13px;font:inherit}.auth-card .btn{width:100%;margin-top:5px}.demo-link{display:block;width:100%;border:0;background:none;color:var(--muted);margin-top:22px;text-align:center;text-decoration:underline;text-underline-offset:3px;cursor:pointer;font:inherit}.request-link{text-align:center;color:var(--muted);font-size:.85rem}.request-link a{color:var(--brand);font-weight:700}.error{color:#b43e43;background:#fff0f0;border-radius:8px;padding:10px;font-size:.9rem}.logo{color:var(--ink);font:700 1.5rem "Space Grotesk";text-decoration:none;letter-spacing:-.06em}.logo i{display:inline-block;width:12px;height:12px;margin-right:8px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 3px var(--brand)}`]
})
export class AuthComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = ''; password = ''; error = '';
  useDemoCredentials(): void { this.email = 'admin@admin.com'; this.password = 'mdp admin'; this.error = ''; }
  login(): void { this.error = ''; this.auth.login(this.email, this.password).subscribe({ next: (user) => { this.auth.saveUser(user); this.router.navigateByUrl(user.role === 'ADMIN' ? '/admin' : '/client'); }, error: () => this.error = 'Email ou mot de passe incorrect.' }); }
}
