import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../../../../shared/services/supabase';
import { cleanContact, contactValidators } from '../contact-validators';
import { NameLogo } from '../../../../../shared/services/name-logo';
import { ToastService } from '../../../../../shared/services/toast.service';
import { SupabaseAuth } from '../../../../../shared/services/supabase-auth';

/** Contact fields the edit dialog needs. */
type EditableContact = { id: number; name: string; email: string; phone: string; role: string };

/** Dialog for editing or deleting a contact. */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-contact',
  styleUrl: './edit-contact.scss',
  templateUrl: './edit-contact.html',
})
export class EditContact implements OnInit {
  private fb = inject(FormBuilder);
  private nlService = inject(NameLogo);
  private db = inject(Supabase);
  private toast = inject(ToastService);
  auth = inject(SupabaseAuth);

  /** The contact being edited, passed in by the contact details. */
  contact = input.required<EditableContact>();
  /** Tells the contact details that the dialog should close. */
  closed = output<void>();
  /** True while saving or deleting; disables the buttons. */
  isSaving = signal(false);
  /** Error shown in the dialog if saving or deleting fails; empty if there is none. */
  errorMessage = signal('');
  /** Initials and colors of the avatar, same as in the details view. */
  avatar = computed(() => this.nlService.setNameLogo(this.contact().name));

  /** Form with name, email and phone, validated by {@link contactValidators}. */
  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  /**
   * Fills the form with the cleaned data of the contact and marks all fields as touched,
   * so errors in the existing data show up right away.
   */
  ngOnInit() {
    this.contactForm.setValue(cleanContact(this.contact()));
    this.contactForm.markAllAsTouched();
  }

  /** Saves the changes; an invalid form only shows its error messages. */
  async onSave() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    const changes = cleanContact(this.contactForm.getRawValue());
    await this.runAction(async () => {
      await this.db.updateContact(this.contact().id, changes);
      this.updateOwnName(changes.name);
    }, 'Contact successfully updated');
  }

  /**
   * Updates the name shown in header and summary if the logged-in user edited their own contact.
   *
   * @param name - The new name of the contact.
   */
  private updateOwnName(name: string) {
    const isOwnContact =
      this.contact().role === 'user' && this.contact().email === this.auth.loggedUserEmail();
    if (isOwnContact) this.auth.loggedUserName.set(name);
  }

  /** Deletes the contact and clears the selection. */
  async onDelete() {
    await this.runAction(async () => {
      await this.db.deleteContact(this.contact().id);
      this.db.selectedContactId.set(null);
    }, 'Contact successfully deleted');
  }

  /**
   * Runs a Supabase action with loading state and error handling: on success the dialog closes
   * and a toast is shown, on failure {@link errorMessage} is shown in the dialog.
   *
   * @param action - The Supabase action to run.
   * @param successMessage - Text of the success toast.
   */
  private async runAction(action: () => Promise<void>, successMessage: string) {
    this.isSaving.set(true);
    this.errorMessage.set('');
    try {
      await action();
      this.closed.emit();
      this.toast.success(successMessage);
    } catch {
      this.errorMessage.set('Something went wrong. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
