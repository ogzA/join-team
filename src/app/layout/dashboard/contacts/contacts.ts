import { Component, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';

@Component({
  imports: [ContactList, ContactDetail],
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
