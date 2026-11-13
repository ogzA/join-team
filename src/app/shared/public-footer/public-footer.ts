import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

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
