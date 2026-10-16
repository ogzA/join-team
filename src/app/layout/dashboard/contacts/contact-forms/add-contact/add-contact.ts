import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../../../../shared/services/supabase';
import { contactValidators } from '../contact-validators';
import { ToastService } from '../../../../../shared/services/toast.service';

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
  isOpen = input(false);
  closed = output<void>();
  isSaving = signal(false);

  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  async formSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      await this.dbService.setContact({ ...this.contactForm.getRawValue(), role: 'User' });
      this.toast.success('Contact successfully created');
      this.close();
    } catch {
      this.toast.error('Contact could not be created');
    } finally {
      this.isSaving.set(false);
    }
  }

  close() {
    this.contactForm.reset();
    this.closed.emit();
  }
}
