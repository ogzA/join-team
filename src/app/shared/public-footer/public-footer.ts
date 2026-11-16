import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Footer of the login and signup pages with links to the privacy policy and legal notice. */
@Component({
  imports: [RouterLink],
  selector: 'app-public-footer',
  styleUrl: './public-footer.scss',
  templateUrl: './public-footer.html',
})
export class PublicFooter {
  /** Page the footer is shown on, passed to the legal pages. */
  from = input('');
}
