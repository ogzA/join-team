import { Component, inject, signal } from '@angular/core';
import { ContactList } from './contact-list/contact-list';
import { ContactDetail } from './contact-detail/contact-detail';
import { EditContact } from './contact-forms/edit-contact/edit-contact'; // Temporär
import { Supabase } from '../../../shared/services/supabase'; // Temporär

@Component({
  imports: [ContactList, ContactDetail, EditContact],
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

  // TEMP: Test für Edit-Dialog, vor Merge entfernen
  db = inject(Supabase);
  isEditTestOpen = signal(true);
}
