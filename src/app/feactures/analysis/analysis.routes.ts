import { Routes } from '@angular/router';
import { AnalysisHome } from './pages/analysis-home/analysis-home';
import { PromptsHome } from './pages/prompts-home/prompts-home';

export const analysis_routes: Routes = [
  {
    path: '',
    component: AnalysisHome,
    title: 'Centro de Analisis | T&A Hub',
  },
  {
    path: 'prompts',
    component: PromptsHome,
    title: 'Prompts | T&A Hub',
  },
];

export default analysis_routes;
