import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./history.component.css'], template: `<app-admin-page title="Historique" eyebrow="SUIVI DE VOTRE PARC" description="Consultez et analysez l'évolution de la consommation énergétique." />` })
export class HistoryComponent {}
