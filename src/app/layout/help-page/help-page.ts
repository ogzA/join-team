import { Component, inject } from '@angular/core';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../shared/services/supabase';

/** Help page that explains what Join is and how to use it. */
@Component({
  imports: [Sidebar, DashboardHeader, RouterLink],
  selector: 'app-help-page',
  styleUrl: './help-page.scss',
  templateUrl: './help-page.html',
})
export class HelpPage {
  dbService = inject(Supabase);

  /** Hides the help icon in the header, because the help page is already open. */
  ngOnInit() {
    document.getElementById('helpLogo')?.classList.add(`d_none`);
  }
}
