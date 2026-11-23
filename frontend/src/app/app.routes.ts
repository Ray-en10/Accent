import { Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { AuthComponent } from './auth.component';
import { AdminComponent } from './admin/dashboard/dashboard.component';
import { AdminShellComponent } from './admin/layout/admin-shell.component';
import { HistoryComponent } from './admin/history/history.component';
import { EnergyComponent } from './admin/history/energy.component';
import { DetailsComponent } from './admin/history/details.component';
import { ComparatorComponent } from './admin/history/comparator.component';
import { ReportComponent } from './admin/reports/report.component';
import { AlertsComponent } from './admin/alerts/alerts.component';
import { AlertManagementComponent } from './admin/alerts/alert-management.component';
import { AlertHistoryComponent } from './admin/alerts/alert-history.component';
import { AdministrationComponent } from './admin/administration/administration.component';
import { MiscComponent } from './admin/misc/misc.component';
import { ConsumptionComponent } from './admin/consumption/consumption.component';
import { RegionDetailsComponent } from './admin/consumption/region-details.component';
import { ClientDashboardComponent } from './client/client-dashboard.component';
import { InstallerDashboardComponent } from './installer/installer-dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'connexion', component: AuthComponent },
  { path: 'client', component: ClientDashboardComponent },
  { path: 'installateur', component: InstallerDashboardComponent },
  { path: 'admin', component: AdminShellComponent, children: [
    { path: '', component: AdminComponent },
    { path: 'consommation', component: ConsumptionComponent },
    { path: 'consommation/:id', component: RegionDetailsComponent },
    { path: 'historique', component: HistoryComponent },
    { path: 'historique/energy', component: EnergyComponent },
    { path: 'historique/details', component: DetailsComponent },
    { path: 'historique/comparateur', component: ComparatorComponent },
    { path: 'rapport', component: ReportComponent },
    { path: 'alertes', component: AlertsComponent },
    { path: 'alertes/gestion', component: AlertManagementComponent },
    { path: 'alertes/historique', component: AlertHistoryComponent },
    { path: 'administration', component: AdministrationComponent },
    { path: 'divers', component: MiscComponent }
  ] },
  { path: '**', redirectTo: '' }
];
