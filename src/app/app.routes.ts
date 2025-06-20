import { Routes } from '@angular/router';
import { ProductosFinancieros } from './pages/productos-financieros/productos-financieros';
import { FormularioIngreso } from './pages/formulario-ingreso/formulario-ingreso';

export const routes: Routes = [
  {
    path: '',
    component: ProductosFinancieros,
  },
  {
    path: 'formulario',
    component: FormularioIngreso,
  },
];
