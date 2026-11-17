import { Component, inject, signal } from '@angular/core';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupabaseAuth } from '../../shared/services/supabase-auth';

/** Legal notice page (imprint) of Join. */
@Component({
  imports: [DashboardHeader, Sidebar, RouterLink, DatePipe],
  selector: 'app-legal-notice',
  styleUrl: './legal-notice.scss',
  templateUrl: './legal-notice.html',
})
export class LegalNotice {
  /** Today's date, shown as the date of the legal notice. */
  today: Date = new Date();
  private supabase_auth = inject(SupabaseAuth);
  /** True if a user is logged in; only then the back arrow is shown. */
  isLoggedIn = signal(false);

  /** Sets {@link isLoggedIn} from the current login state. */
  async ngOnInit() {
    this.isLoggedIn.set(await this.supabase_auth.isLoggedIn());
  }
}
