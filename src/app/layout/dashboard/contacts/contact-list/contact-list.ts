import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { AddContact } from '../contact-forms/add-contact/add-contact';
import { NameLogo } from '../../../../shared/services/name-logo';
import { TitleCasePipe } from '@angular/common';

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
  contacts = this.dbService.contacts;

  groupedContacts = computed(() => {
    // Sortieren nach Namen ohne Titel, damit "Dr. Vorname Nachname" unter "V" landet
    const sortedContacts = [...this.contacts()].sort((a, b) =>
      this.nlService.stripTitle(a.name).localeCompare(this.nlService.stripTitle(b.name), 'de'),
    );

    // Anfangsbuchstaben ohne Titel sammeln
    const letters = [
      ...new Set(
        sortedContacts.map((contact) =>
          this.nlService.stripTitle(contact.name).charAt(0).toUpperCase(),
        ),
      ),
    ].sort((a, b) => a.localeCompare(b, 'de'));

    // Kontakte dem Buchstaben ohne Titel zuordnen
    return letters.map((letter) => {
      return {
        letter: letter,
        contacts: sortedContacts.filter(
          (contact) => this.nlService.stripTitle(contact.name).charAt(0).toUpperCase() === letter,
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
