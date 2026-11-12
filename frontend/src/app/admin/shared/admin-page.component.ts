import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  template: `<header class="page-header"><div><p class="eyebrow">{{eyebrow}}</p><h1>{{title}}</h1></div></header><section class="card page-card"><h2>{{title}}</h2><p>{{description}}</p><div class="empty-state">Cette section est prête pour vos données {{title.toLowerCase()}}.</div></section>`,
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent {
  @Input() title = '';
  @Input() eyebrow = '';
  @Input() description = '';
}
