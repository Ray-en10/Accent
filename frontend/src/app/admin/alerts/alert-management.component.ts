import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./alert-management.component.css'], template: `<app-admin-page title="Gestion des alertes" eyebrow="ALERTE" description="Configurez les règles et les destinataires des alertes." />` })
export class AlertManagementComponent {}
