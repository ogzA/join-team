import { Component, inject, input, output, VERSION } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Supabase } from '../../../../shared/services/supabase';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-contact',
  styleUrl: './add-contact.scss',
  templateUrl: './add-contact.html',
})
export class AddContact {
  dbservice = inject(Supabase);
  showModal: boolean | undefined;
  isOpen = input(false);   
  closed = output<void>();

  fb = inject(FormBuilder);
  contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern('^[A-Za-z][A-Za-z ]*$')]],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'),
      ],
    ],
    phone: ['', [Validators.required, Validators.pattern('^[\\+]?[0-9]{10,16}$')]],
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

    console.log(contactObj);
    this.dbservice.setContact(contactObj);
    this.close();
    } 
  }

  close() {
    this.closed.emit();
  }
}
