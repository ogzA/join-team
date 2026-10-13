import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { Contacts } from './layout/dashboard/contacts/contacts';
import { EditContact } from './layout/dashboard/contacts/contact-forms/edit-contact/edit-contact';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: 'contacts', component: Contacts },
      { path: 'edit-test', component: EditContact }, // Temporär eingebaut für den Test
    ],
  },
];
