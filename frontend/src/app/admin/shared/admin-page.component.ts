import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  template: `<header class="page-header"><div><p class="eyebrow">{{eyebrow}}</p><h1>{{title}}</h1><p class="page-intro">{{description}}</p></div></header><section class="card page-card"><div class="page-card-head"><div><p class="eyebrow">ESPACE DE TRAVAIL</p><h2>Suivi {{title.toLowerCase()}}</h2></div><span class="live-state">● Synchronisé</span></div><div class="empty-state"><div class="empty-icon">⌁</div><b>Vos données apparaîtront ici</b><p>Connectez vos sites et compteurs pour retrouver vos indicateurs de {{title.toLowerCase()}} dans cet espace.</p><button class="btn outline" type="button">Configurer maintenant</button></div></section>`,
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent {
  @Input() title = '';
  @Input() eyebrow = '';
  @Input() description = '';
}
