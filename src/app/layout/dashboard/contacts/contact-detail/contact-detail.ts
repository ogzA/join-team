import { Component, computed, inject, signal } from '@angular/core';
import { NameLogo } from '../../../../shared/services/name-logo';
import { Supabase } from '../../../../shared/services/supabase';
import { EditContact } from '../contact-forms/edit-contact/edit-contact';
import { ToastService } from '../../../../shared/services/toast.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  imports: [EditContact, TitleCasePipe],
  selector: 'app-contact-detail',
  styleUrl: './contact-detail.scss',
  templateUrl: './contact-detail.html',
})
export class ContactDetail {
  dbService = inject(Supabase);
  nlService = inject(NameLogo);
  toast = inject(ToastService);

  isEditOpen = signal(false);
  isMenuOpen = signal(false);

  nameLogo = computed(() => {
    const contact = this.dbService.selectedContact();
    return this.nlService.setNameLogo(contact?.name ?? '');
  });

  changeStyles() {
    return `background:${this.nameLogo().color}; color:${this.nameLogo().textColor}`;
  }

  editContact() {
    this.isMenuOpen.set(false);
    this.isEditOpen.set(true);
  }

  async deleteContact(id: number) {
    this.isMenuOpen.set(false);
    try {
      await this.dbService.deleteContact(id);
      this.dbService.selectedContactId.set(null);
      this.toast.success('Contact successfully deleted');
    } catch {
      this.toast.error('Contact could not be deleted');
    }
  }
}
