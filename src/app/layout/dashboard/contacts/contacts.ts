import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-contacts',
  styleUrl: './contacts.scss',
  templateUrl: './contacts.html',
  host: {
    '[class.show-details]': 'selectedContactID() !== null',
  },
})
export class Contacts {
  /**
   * ID of the currently selected contact, null if none is selected.
   */
  selectedContactID = signal<number | null>(null);
}
