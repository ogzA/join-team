import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-dashboard-header',
  styleUrl: './dashboard-header.scss',
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  mobile_menu = signal<boolean>(false);

  openMobileMenu()
  {
    this.mobile_menu.set(true);
  }

  closeMenu()
  {
    this.mobile_menu.set(false);
  }
}
