import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { Contacts } from './layout/dashboard/contacts/contacts';
import { HelpPage } from './layout/help-page/help-page';
import { PrivacyPolicy } from './layout/privacy-policy/privacy-policy';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'contacts', pathMatch: 'full' },
      { path: 'contacts', component: Contacts },
    ],
  },
  {
    path: 'help-page',
    component: HelpPage,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicy,
  },
];
