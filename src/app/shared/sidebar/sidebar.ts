import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseAuth } from '../services/supabase-auth';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  supabase_auth = inject(SupabaseAuth);
  isLoggedIn = signal<boolean | null>(null);
  /** True if the user came from the signup page (set by the privacy link there). */
  fromSignup = history.state?.from === 'signup';

  async ngOnInit() {
    this.isLoggedIn.set(await this.supabase_auth.isLoggedIn());
  }
}
