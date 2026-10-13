import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { Contacts } from './layout/dashboard/contacts/contacts';
import { HelpPage } from './layout/help-page/help-page';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [{ path: 'contacts', component: Contacts }],
  },
  {
    path: 'help-page',
    component: HelpPage,
  },
];
