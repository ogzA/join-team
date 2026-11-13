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
  auth = inject(SupabaseAuth);
  /** True if the user came from the signup page (set by the privacy link there). */
  fromSignup = history.state?.from === 'signup';
}
