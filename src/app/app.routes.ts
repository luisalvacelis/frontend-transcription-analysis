import { Routes } from '@angular/router';
import { Home } from './feactures/shell/home/home';
import { AuthGuard } from '@guards/auth-guard';
import { GuestGuard } from '@guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./feactures/shell/home/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'campaigns',
        loadChildren: () =>
          import('./feactures/campaigns/campaigns.routes').then((m) => m.campaigns_routes),
      },
      {
        path: 'audios',
        loadChildren: () => import('./feactures/audios/audios.routes').then((m) => m.audios_routes),
      },
      {
        path: 'audios_analysis',
        loadChildren: () =>
          import('./feactures/analysis/analysis.routes').then((m) => m.analysis_routes),
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () => import('./feactures/auth/auth.routes').then((m) => m.auth_routes),
  },
];
