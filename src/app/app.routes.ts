import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { Contacts } from './layout/dashboard/contacts/contacts';

export const routes: Routes = [
    {
        path: '',
        component: Dashboard,
        children: [
            { path: 'contacts', component: Contacts },
        ],
    },
];
