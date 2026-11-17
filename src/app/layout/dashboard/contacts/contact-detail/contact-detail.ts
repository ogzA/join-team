import { Component, computed, inject, signal } from '@angular/core';
import { NameLogo } from '../../../../shared/services/name-logo';
import { Supabase } from '../../../../shared/services/supabase';
import { EditContact } from '../contact-forms/edit-contact/edit-contact';
import { ToastService } from '../../../../shared/services/toast.service';
import { SupabaseAuth } from '../../../../shared/services/supabase-auth';

/**
 * Details of the selected contact with edit and delete actions (in an options menu on mobile)
 * and the edit dialog.
 */
@Component({
  imports: [EditContact],
  selector: 'app-contact-detail',
  styleUrl: './contact-detail.scss',
  templateUrl: './contact-detail.html',
})
export class ContactDetail {
  dbService = inject(Supabase);
  nlService = inject(NameLogo);
  toast = inject(ToastService);
  auth = inject(SupabaseAuth);
  /** True while the edit dialog is open. */
  isEditOpen = signal(false);
  /** True while the options menu (mobile) is open. */
  isMenuOpen = signal(false);
  /** Initials and colors of the avatar of the selected contact. */
  nameLogo = computed(() => {
    const contact = this.dbService.selectedContact();
    return this.nlService.setNameLogo(contact?.name ?? '');
  });

  /**
   * Builds the inline style of the avatar.
   *
   * @returns CSS with the background and text color of the avatar.
   */
  changeStyles() {
    return `background:${this.nameLogo().color}; color:${this.nameLogo().textColor}`;
  }

  /** Closes the options menu and opens the edit dialog. */
  editContact() {
    this.isMenuOpen.set(false);
    this.isEditOpen.set(true);
  }

  /**
   * Deletes the contact, clears the selection and shows the result as a toast.
   *
   * @param id - Id of the contact.
   */
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
