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

/** Header of the dashboard pages with the help link, the user avatar and the user menu. */
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
  /** True while the user menu below the avatar is open. */
  mobile_menu = signal<boolean>(false);
  private router = inject(Router);

  /**
   * Injects the host element of the header.
   *
   * @param elementRef - Host element of the header; currently not used.
   */
  constructor(private elementRef: ElementRef) {}

  /**
   * Closes the open user menu on any click in the document, also inside the menu. The click on
   * the avatar button does not get here, see {@link openMobileMenu}.
   *
   * @param event - The click event; not used.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.mobile_menu()) {
      this.closeMenu();
    }
  }

  /**
   * Opens or closes the user menu. Stops the click from bubbling up, otherwise
   * {@link onDocumentClick} would close the menu again right away.
   *
   * @param event - The click on the avatar button.
   */
  openMobileMenu(event: Event) {
    event.stopPropagation();
    this.mobile_menu.set(!this.mobile_menu());
  }

  /** Closes the user menu. */
  closeMenu() {
    this.mobile_menu.set(false);
  }

  /** Closes the menu, lets the intro play again on the login page and logs out. */
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
