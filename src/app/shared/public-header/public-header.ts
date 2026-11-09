import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-public-header',
  styleUrl: './public-header.scss',
  templateUrl: './public-header.html',
})
export class PublicHeader {
  showSignup = input(true);
}
