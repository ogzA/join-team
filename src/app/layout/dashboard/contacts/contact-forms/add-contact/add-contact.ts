import { Component, inject, input, output, VERSION } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Supabase } from '../../../../../shared/services/supabase';
import { Router } from '@angular/router';
import { contactValidators } from '../contact-validators';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-contact',
  styleUrl: './add-contact.scss',
  templateUrl: './add-contact.html',
})
export class AddContact {
  dbservice = inject(Supabase);
  private toast = inject(ToastService);
  showModal: boolean | undefined;
  isOpen = input(false);   
  closed = output<void>();

  fb = inject(FormBuilder);

  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  formSubmit() {
  
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.contactForm.reset(this.contactForm.value);
      return;
    }
    else{
    const contactObj = {
      ...this.contactForm.getRawValue(),
      role: 'User',
    };

    this.dbservice.setContact(contactObj);
    this.toast.success('Contact succesfully created');
    this.close();
    } 
  }

  close() {
    this.contactForm.reset();
    this.contactForm.markAsUntouched();
    this.closed.emit();
  }
}
