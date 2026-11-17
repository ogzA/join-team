import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { AddContact } from '../contact-forms/add-contact/add-contact';
import { NameLogo } from '../../../../shared/services/name-logo';

/** List of all contacts grouped by their first letter, with the add contact button and dialog. */
@Component({
  imports: [AddContact],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  private router = inject(Router);
  dbService = inject(Supabase);
  nlService = inject(NameLogo);
  /** All contacts of the service, sorted by name. */
  contacts = this.dbService.contacts;

  /**
   * Scrolls to the selected contact whenever the selection changes, e.g. right after it was
   * created. The scroll waits one macrotask, so a new contact is already rendered.
   */
  constructor() {
    effect(() => {
      const id = this.dbService.selectedContactId();
      if (id === null) return;
      setTimeout(() =>
        document
          .getElementById('contact-' + id)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
      );
    });
  }

  /**
   * Contacts grouped by the first letter of their name; letters and contacts are sorted
   * alphabetically (German collation). Titles are ignored, so "Dr. Max Muster" is listed
   * under "M".
   *
   * @see NameLogo.stripTitle in name-logo.ts removes the titles.
   */
  groupedContacts = computed(() => {
    const sortedContacts = [...this.contacts()].sort((a, b) =>
      this.nlService.stripTitle(a.name).localeCompare(this.nlService.stripTitle(b.name), 'de'),
    );

    const letters = [
      ...new Set(
        sortedContacts.map((contact) =>
          this.nlService.stripTitle(contact.name).charAt(0).toUpperCase(),
        ),
      ),
    ].sort((a, b) => a.localeCompare(b, 'de'));

    return letters.map((letter) => {
      return {
        letter: letter,
        contacts: sortedContacts.filter(
          (contact) => this.nlService.stripTitle(contact.name).charAt(0).toUpperCase() === letter,
        ),
      };
    });
  });

  /** True while the add contact dialog is open. */
  isDialogOpen = false;

  /** Reloads the contacts from Supabase. */
  async ngOnInit() {
    await this.dbService.getContacts();
  }

  /** Opens the add contact dialog. */
  openDialog() {
    this.isDialogOpen = true;
  }

  /** Closes the add contact dialog. */
  closeDialog() {
    this.isDialogOpen = false;
  }
}
