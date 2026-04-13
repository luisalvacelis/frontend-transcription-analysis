import { Routes } from '@angular/router';
import { AnalysisHome } from './pages/analysis-home/analysis-home';

export const analysis_routes: Routes = [
  {
    path: '',
    component: AnalysisHome,
    title: 'Centro de Analisis | T&A Hub',
  },
];

export default analysis_routes;
