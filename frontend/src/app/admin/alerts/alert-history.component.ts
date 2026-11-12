import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./alert-history.component.css'], template: `<app-admin-page title="Historique des alertes" eyebrow="ALERTE" description="Retrouvez les alertes déclenchées et leur résolution." />` })
export class AlertHistoryComponent {}
