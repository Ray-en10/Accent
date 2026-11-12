import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./details.component.css'], template: `<app-admin-page title="Details" eyebrow="HISTORIQUE" description="Explorez le détail des relevés et des équipements." />` })
export class DetailsComponent {}
