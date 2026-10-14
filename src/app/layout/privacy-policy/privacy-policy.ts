import { Component } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [Sidebar, DashboardHeader, RouterOutlet, RouterLink],
  selector: 'app-privacy-policy',
  styleUrl: './privacy-policy.scss',
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicy {}
