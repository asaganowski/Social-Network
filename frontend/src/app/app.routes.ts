import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./components/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'network',
    loadComponent: () => import('./components/network/network.component').then(m => m.NetworkComponent)
  },
  {
    path: '**',
    redirectTo: '/network'
  }
];
