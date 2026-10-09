import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { ContactDetail } from './layout/dashboard/contact-detail/contact-detail';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'contact-detail', component: ContactDetail },
];
