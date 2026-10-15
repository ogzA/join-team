import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AddContact } from '../add-contact/add-contact';
import { Supabase } from '../../../../shared/services/supabase';

@Component({
  imports: [AddContact],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  private router = inject(Router);
  dbService = inject(Supabase);
  contacts = this.dbService.contacts;

  groupedContacts = computed(() => {
    const sortedContacts = [...this.contacts()].sort((a, b) => a.name.localeCompare(b.name, 'de'));

    console.log('Sorted Contacts', sortedContacts);

    const letters = [
      ...new Set(sortedContacts.map((contact) => contact.name.charAt(0).toUpperCase())),
    ].sort((a, b) => a.localeCompare(b, 'de'));

    return letters.map((letter) => {
      return {
        letter: letter,
        contacts: sortedContacts.filter(
          (contact) => contact.name.charAt(0).toUpperCase() === letter,
        ),
      };
    });
  });

  isDialogOpen = false;

  async ngOnInit() {
    await this.dbService.getContacts();
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
}
