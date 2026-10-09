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
    console.log("open menu mobile")
  }

  closeMenu()
  {
    this.mobile_menu.set(false);
  }
}
