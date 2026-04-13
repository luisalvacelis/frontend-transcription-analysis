import { Routes } from '@angular/router';
import { AudiosHome } from './pages/audios-home/audios-home';

export const audios_routes: Routes = [
  {
    path: '',
    component: AudiosHome,
    title: 'Audios | T&A Hub'
  }
]

export default audios_routes;
