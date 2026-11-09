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
import { PublicHeader } from './shared/public-header/public-header';
import { LoginForm } from './shared/login-form/login-form';
import { Summary } from './layout/dashboard/summary/summary';
import { PublicFooter } from './shared/public-footer/public-footer';
import { SignupForm } from './shared/signup-form/signup-form';
import { authGuard } from './shared/services/auth_guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      // { path: '', redirectTo: 'summary', pathMatch: 'full'},
      { path: 'summary', component: Summary },
      { path: 'add-task', component: AddTask },
      { path: 'board', component: Board },
      { path: 'contacts', component: Contacts },
      { path: 'assigned-to-dropdown', component: AssignedToDropdown },
      { path: 'show-task-detail', component: ShowTaskDetails },
    ]
  },
  // {
  //   path: 'summary',
  //   component: Summary,
  // },
  // {
  //   path: 'add-task',
  //   component: AddTask,
  // },
  // {
  //   path: 'board',
  //   component: Board,
  // },
  // {
  //   path: 'contacts',
  //   component: Contacts,
  // },
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
  {
    path: '',
    component: LoginForm,
  },
  {
    path: 'signup',
    component: SignupForm,
  },
];
