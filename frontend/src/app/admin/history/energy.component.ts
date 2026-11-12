import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./energy.component.css'], template: `<app-admin-page title="Energy" eyebrow="HISTORIQUE" description="Suivez les niveaux d'énergie et la consommation de chaque site." />` })
export class EnergyComponent {}
