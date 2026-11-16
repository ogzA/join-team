import {
  Component,
  HostListener,
  signal,
  ElementRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseAuth } from '../services/supabase-auth';
import { Intro } from '../services/intro';
import { NameLogo } from '../services/name-logo';
import { Supabase } from '../services/supabase';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard-header',
  styleUrl: './dashboard-header.scss',
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  dbService = inject(Supabase);
  private auth = inject(SupabaseAuth);
  private intro = inject(Intro);
  nlService = inject(NameLogo);
  mobile_menu = signal<boolean>(false);
  private router = inject(Router);

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
    await this.auth.signOut();
  }

  setRoute() {
    this.dbService.currentRoute.set(this.router.url);
    // console.log('Aktive Route:', this.dbService.currentUrl());
  }
}
