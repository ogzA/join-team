import { Component, inject, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { Supabase } from '../../../shared/services/supabase';

/**
 * Contacts page with the contact list and the details of the selected contact.
 * On mobile only one of both is shown at a time (host class `show-details`).
 */
@Component({
  imports: [ContactList, ContactDetail],
  selector: 'app-contacts',
  styleUrl: './contacts.scss',
  templateUrl: './contacts.html',
  host: {
    '[class.show-details]': 'dbService.selectedContactId() !== null',
  },
})
export class Contacts {
  dbService = inject(Supabase);
  /** Id of the contact whose details were shown last; starts with `0` (no contact). */
  shownID: number | null = 0;
  /** True while the details are rendered; toggled to replay their enter animation. */
  isShown = signal(false);

  /**
   * Replays the enter animation of the details after a click in the list selected another
   * contact: hides the details if they are shown and shows them again after 125 ms.
   */
  toggle() {
    if (this.dbService.selectedContactId() != this.shownID) {
      if (this.isShown()) {
        this.isShown.update((isShown) => !isShown);
      }

      this.shownID = this.dbService.selectedContactId();
      setTimeout(() => {
        this.isShown.update((isShown) => !isShown);
      }, 125);
    }
  }

  /** Clears the selection and returns to the contact list on mobile. */
  closeDetails() {
    this.dbService.selectedContactId.set(null);
  }
}
