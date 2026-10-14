import { Component, computed, inject, signal } from '@angular/core';
import { NameLogo } from '../../../../shared/services/name-logo';
import { Supabase } from '../../../../shared/services/supabase';
import { EditContact } from '../contact-forms/edit-contact/edit-contact';

@Component({
  imports: [EditContact],
  selector: 'app-contact-detail',
  styleUrl: './contact-detail.scss',
  templateUrl: './contact-detail.html',
})
export class ContactDetail {
  dbService = inject(Supabase);
  nlService = inject(NameLogo);

  isEditOpen = signal(false);

  nameLogo = computed(() => {
    const contact = this.dbService.selectedContact();
    return this.nlService.setNameLogo(contact?.name ?? '');
  });

  changeStyles() {
    return `background:${this.nameLogo().color}`;
  }

  editContact() {
    this.isEditOpen.set(true);
  }

  async deleteContact(id: number) {
    await this.dbService.deleteContact(id);
    this.dbService.selectedContactId.set(null);
  }
}