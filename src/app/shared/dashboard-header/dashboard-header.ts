import {
  Component,
  HostListener,
  signal,
  ElementRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseAuth } from '../services/supabase-auth';
import { Intro } from '../services/intro';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard-header',
  styleUrl: './dashboard-header.scss',
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  private supabase_auth = inject(SupabaseAuth);
  private intro = inject(Intro);
  mobile_menu = signal<boolean>(false);

  constructor(private elementRef: ElementRef) {}

  // Automatically listen to all document clicks
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // If the menu is open and the user clicks outside this component, close it
    if (this.mobile_menu()) {
      this.closeMenu();
    }
  }

  openMobileMenu(event: Event) {
    event.stopPropagation(); // to prevent it from immediately closing itself
    this.mobile_menu.set(!this.mobile_menu());
  }

  closeMenu() {
    this.mobile_menu.set(false);
  }

  async logout() {
    this.closeMenu();
    this.intro.reset();
    await this.supabase_auth.signOut();
  }
}
