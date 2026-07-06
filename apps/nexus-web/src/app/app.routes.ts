import { Route } from '@angular/router';
import { WorkspaceComponent } from './workspace/workspace.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const appRoutes: Route[] = [
  { path: '', component: DashboardComponent },
  { path: 'generate', component: WorkspaceComponent },
];
