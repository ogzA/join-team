import { Component, inject, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { Supabase } from '../../../shared/services/supabase';

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

  isShown = signal(false);
  toggle() {
    // if (this.isShown() == false) {
    this.isShown.update((isShown) => !isShown);
    // } else if (this.isShown()) {
    //   this.isShown.update((isShown) => !isShown);

    //   setTimeout(() => {
    //     this.isShown.update((isShown) => !isShown);
    //   }, 100);
    // }
  }

  /**
   * Clears the selection and returns to the contact list on mobile
   */
  closeDetails() {
    this.dbService.selectedContactId.set(null);
  }
}
