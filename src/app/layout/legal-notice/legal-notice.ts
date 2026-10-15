import { Component } from '@angular/core';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterLink } from '@angular/router';

@Component({
  imports: [DashboardHeader, Sidebar, RouterLink],
  selector: 'app-legal-notice',
  styleUrl: './legal-notice.scss',
  templateUrl: './legal-notice.html',
})
export class LegalNotice {}
