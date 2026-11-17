import { Component, inject, input } from '@angular/core';
import { Intro } from '../services/intro';
import { IntroOverlay } from '../intro-overlay/intro-overlay';
import { RouterLink } from '@angular/router';

/** Header of the login and signup pages; also shows the intro until it has been played. */
@Component({
  imports: [RouterLink, IntroOverlay],
  selector: 'app-public-header',
  styleUrl: './public-header.scss',
  templateUrl: './public-header.html',
})
export class PublicHeader {
  /** Shows the "Sign up" button; the signup page turns it off. */
  showSignup = input(true);
  protected intro = inject(Intro);
}
