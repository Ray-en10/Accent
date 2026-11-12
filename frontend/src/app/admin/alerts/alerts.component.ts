import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./alerts.component.css'], template: `<app-admin-page title="Alerte" eyebrow="SURVEILLANCE" description="Centralisez les alertes et les actions à traiter." />` })
export class AlertsComponent {}
