import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./report.component.css'], template: `<app-admin-page title="Rapport" eyebrow="DOCUMENTS" description="Générez et consultez vos rapports énergétiques." />` })
export class ReportComponent {}
