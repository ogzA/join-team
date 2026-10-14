import { Component, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  imports: [RouterLink],
  selector: 'app-dashboard-header',
  styleUrl: './dashboard-header.scss',
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  mobile_menu = signal<boolean>(false);

  openMobileMenu() {
  openMobileMenu() {
    this.mobile_menu.set(true);
  }

  closeMenu() {
  closeMenu() {
    this.mobile_menu.set(false);
  }
}
