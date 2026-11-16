import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../../../../shared/services/supabase';
import { cleanContact, contactValidators } from '../contact-validators';
import { ToastService } from '../../../../../shared/services/toast.service';

/** Dialog for creating a new contact. */
@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-contact',
  styleUrl: './add-contact.scss',
  templateUrl: './add-contact.html',
})
export class AddContact {
  private dbService = inject(Supabase);
  private toast = inject(ToastService);

  private fb = inject(FormBuilder);
  /** True while the dialog is shown. */
  isOpen = input(false);
  /** Emits when the dialog should close. */
  closed = output<void>();
  /** True while the contact is being saved; disables the submit button. */
  isSaving = signal(false);

  /** Form with name, email and phone, validated by {@link contactValidators}. */
  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  /**
   * Saves the new contact, selects and highlights it in the list and closes the dialog.
   * An invalid form only shows its error messages. If saving fails, the error toast says that
   * the email already exists.
   */
  async formSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      const newContact = await this.dbService.setContact({
        ...cleanContact(this.contactForm.getRawValue()),
        role: 'User',
      });
      this.dbService.selectContact(newContact.id);
      this.toast.success('Contact successfully created');
      this.close();
    } catch {
      this.toast.error('A contact with this email already exists');
    } finally {
      this.isSaving.set(false);
    }
  }

  /** Resets the form and emits {@link closed}. */
  close() {
    this.contactForm.reset();
    this.closed.emit();
  }
}
