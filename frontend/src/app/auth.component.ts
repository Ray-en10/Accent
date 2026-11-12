import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  template: `
  <main class="auth-shell"><a class="back" routerLink="/">← Retour au site</a><section class="auth-card card"><a class="logo" routerLink="/"><i></i>tricity</a><div class="tabs"><button [class.active]="mode==='login'" (click)="mode='login'">Se connecter</button><button [class.active]="mode==='create'" (click)="mode='create'">Créer un compte</button></div>
  @if (mode === 'login') { <p class="eyebrow">ESPACE SÉCURISÉ</p><h1>Bon retour.</h1><p class="hint">Accédez à vos données et à vos objectifs d'énergie.</p><form (ngSubmit)="login()"><label>Email<input name="email" type="email" [(ngModel)]="email" required></label><label>Mot de passe<input name="password" type="password" [(ngModel)]="password" required></label>@if(error){<div class="error">{{error}}</div>}<button class="btn" type="submit">Ouvrir mon espace →</button></form><button class="demo-link" type="button" (click)="useDemoCredentials()">Démo back-office : admin@admin.com · mdp admin</button> }
  @else { <p class="eyebrow">NOUVEAU CHEZ TRICITY</p><h1>Votre énergie,<br>à portée de main.</h1><p class="hint">Crée Vote compte client.</p><form (ngSubmit)="create()"><label>Nom complet<input name="name" [(ngModel)]="name" required></label><label>Email<input name="newEmail" type="email" [(ngModel)]="email" required></label><label>Mot de passe<input name="newPassword" type="password" [(ngModel)]="password" required></label><button class="btn" type="submit">Créer mon compte →</button></form> }</section></main>`,
  styles: [`.auth-shell{min-height:100vh;padding:28px;display:grid;place-items:center;position:relative}.back{position:absolute;top:28px;left:28px;color:var(--muted);text-decoration:none;font-weight:600}.auth-card{width:min(480px,100%);padding:40px}.tabs{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line);margin:38px 0}.tabs button{border:0;background:none;color:var(--muted);padding:14px 5px;font-weight:700;cursor:pointer}.tabs button.active{color:var(--brand);border-bottom:3px solid var(--brand)}.auth-card h1{font-size:2.7rem;margin:10px 0}.hint{color:var(--muted);margin:0 0 28px}.auth-card form{display:grid;gap:18px}.auth-card label{display:grid;gap:7px;font-size:.86rem;font-weight:700}.auth-card input{border:1px solid var(--line);border-radius:10px;padding:13px;font:inherit}.auth-card .btn{width:100%;margin-top:5px}.demo-link{display:block;width:100%;border:0;background:none;color:var(--muted);margin-top:22px;text-align:center;text-decoration:underline;text-underline-offset:3px;cursor:pointer;font:inherit}.error{color:#b43e43;background:#fff0f0;border-radius:8px;padding:10px;font-size:.9rem}.logo{color:var(--ink);font:700 1.5rem "Space Grotesk";text-decoration:none;letter-spacing:-.06em}.logo i{display:inline-block;width:12px;height:12px;margin-right:8px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 3px var(--brand)}`]
})
export class AuthComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  mode: 'login' | 'create' = 'login'; email = ''; password = ''; name = ''; error = '';
  useDemoCredentials(): void { this.mode = 'login'; this.email = 'admin@admin.com'; this.password = 'mdp admin'; this.error = ''; }
  login(): void { this.error = ''; this.auth.login(this.email, this.password).subscribe({ next: (user) => this.router.navigateByUrl(user.role === 'ADMIN' ? '/admin' : '/'), error: () => this.error = 'Email ou mot de passe incorrect.' }); }
  create(): void { this.auth.createClient(this.name, this.email, this.password).subscribe({ next: () => { this.mode = 'login'; this.error = ''; }, error: () => this.error = 'Impossible de créer le compte.' }); }
}
