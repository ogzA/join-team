import { Component, inject, signal } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { RouterLink } from '@angular/router';
import { SupabaseAuth } from '../../shared/services/supabase-auth';

@Component({
  imports: [Sidebar, DashboardHeader, RouterLink],
  selector: 'app-privacy-policy',
  styleUrl: './privacy-policy.scss',
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicy {
  private supabase_auth = inject(SupabaseAuth);
  isLoggedIn = signal(false);

  async ngOnInit() {
    this.isLoggedIn.set(await this.supabase_auth.isLoggedIn());
  }
}
