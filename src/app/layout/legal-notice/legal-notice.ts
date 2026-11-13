import { Component, inject, signal } from '@angular/core';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupabaseAuth } from '../../shared/services/supabase-auth';

@Component({
  imports: [DashboardHeader, Sidebar, RouterLink, DatePipe],
  selector: 'app-legal-notice',
  styleUrl: './legal-notice.scss',
  templateUrl: './legal-notice.html',
})
export class LegalNotice {
  today: Date = new Date();
  private supabase_auth = inject(SupabaseAuth);
  isLoggedIn = signal(false);

  async ngOnInit() {
    this.isLoggedIn.set(await this.supabase_auth.isLoggedIn());
  }
}
