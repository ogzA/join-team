import { Component, inject, VERSION } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Supabase } from '../../shared/services/supabase';

interface Contact {
  name: string;
  email: string;
  phone: number;
  role:string
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-contact',
  styleUrl: './add-contact.scss',
  templateUrl: './add-contact.html',
})
export class AddContact {
  dbservice = inject(Supabase);
  showModal: boolean | undefined;
  contactObj: Contact | undefined;

  fb = inject(FormBuilder);
  sentForm: boolean = false;

  contactForm = this.fb.group({
    name: ['', [Validators.required]],
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

  toggleModal() {
    this.showModal = !this.showModal;
  }

  formSubmit() {
    if (this.contactForm.valid) {
      console.log(this.contactForm.value);
      this.contactForm.value;
      this.showModal = false;
      // this.contactObj = {
      //   name: this.contactForm.value.name,
      //   email: this.contactForm.value.email,
      //   phone: this.contactForm.value.phone,
      //   role: 'User',
      // };
      // this.dbservice.setContact(this.contactObj);
    }
  }
}
