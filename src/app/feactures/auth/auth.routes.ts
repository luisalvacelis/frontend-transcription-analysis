import { Routes } from '@angular/router';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { LoginPage } from './pages/login-page/login-page';

export const auth_routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: LoginPage
      },
      {
        path: '**',
        redirectTo: 'login'
      }
    ]
  }
];

export default auth_routes;
