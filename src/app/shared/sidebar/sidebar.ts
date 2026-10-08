import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
   isMobile = signal(window.innerWidth <= 700);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 700);
  }
}
