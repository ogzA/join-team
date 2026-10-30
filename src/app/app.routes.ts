import { Routes } from '@angular/router';
import { Dashboard } from './layout/dashboard/dashboard';
import { Contacts } from './layout/dashboard/contacts/contacts';
import { Board } from './layout/dashboard/board/board';
import { LegalNotice } from './layout/legal-notice/legal-notice';
import { HelpPage } from './layout/help-page/help-page';
import { PrivacyPolicy } from './layout/privacy-policy/privacy-policy';
import { AddTask } from './layout/dashboard/Task/add-task/add-task';
import { AssignedToDropdown } from './shared/assigned-to-dropdown/assigned-to-dropdown';
import { ShowTaskDetails } from './layout/dashboard/Task/show-task-details/show-task-details';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'contacts', pathMatch: 'full' },
      { path: 'contacts', component: Contacts },
      { path: 'add-task', component: AddTask },
      { path: 'board', component: Board },
      { path: 'assigned-to-dropdown', component: AssignedToDropdown },
      { path: 'show-task-detail', component: ShowTaskDetails }
    ],
  },
  {
    path: 'contacts',
    component: Contacts,
  },
  {
    path: 'help-page',
    component: HelpPage,
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicy,
  },
  {
    path: 'legal-notice',
    component: LegalNotice,
  },
];
