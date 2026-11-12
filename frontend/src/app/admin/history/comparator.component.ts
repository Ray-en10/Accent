import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./comparator.component.css'], template: `<app-admin-page title="Comparateur" eyebrow="HISTORIQUE" description="Comparez les performances énergétiques de vos sites." />` })
export class ComparatorComponent {}
