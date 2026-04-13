import { CampaignsHome } from './pages/campaigns-home/campaigns-home';
import { Routes } from '@angular/router';

export const campaigns_routes: Routes = [
  {
    path: '',
    component: CampaignsHome,
    title: 'Campañas | T&A Hub'
  }
]

export default campaigns_routes;
