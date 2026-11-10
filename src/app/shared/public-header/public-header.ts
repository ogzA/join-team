import { Component, inject, input } from '@angular/core';
import { Intro } from '../services/intro';
import { IntroOverlay } from '../intro-overlay/intro-overlay';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink, IntroOverlay],
  selector: 'app-public-header',
  styleUrl: './public-header.scss',
  templateUrl: './public-header.html',
})
export class PublicHeader {
  showSignup = input(true);
  protected intro = inject(Intro);
}
