import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AddContact } from '../add-contact/add-contact';
import { Supabase } from '../../../../shared/services/supabase';

const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

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
    const groups = ALPHABET.map((letter) => {
      return {
        letter: letter,
        contacts: this.contacts().filter(
          (contact) => contact.name.charAt(0).toUpperCase() === letter,
        ),
      };
    });
    console.log(groups.filter((group) => group.contacts.length > 0));
    return groups.filter((group) => group.contacts.length > 0);
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
