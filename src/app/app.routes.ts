import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { Contacts } from './layout/dashboard/contacts/contacts';
import { PrivacyPolicy } from './layout/privacy-policy/privacy-policy';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [{ path: 'contacts', component: Contacts }],
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicy,
  },
];
