import { Component } from '@angular/core';
import { AdminPageComponent } from '../shared/admin-page.component';

@Component({ standalone: true, imports: [AdminPageComponent], styleUrls: ['./misc.component.css'], template: `<app-admin-page title="Divers" eyebrow="OUTILS" description="Accédez aux outils et informations complémentaires du back-office." />` })
export class MiscComponent {}
