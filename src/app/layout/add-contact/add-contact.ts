import { Component, inject, VERSION } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors,Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-contact',
  styleUrl: './add-contact.scss',
  templateUrl: './add-contact.html',
})
export class AddContact {
  showModal: boolean | undefined;

  fb = inject(FormBuilder);
  sentForm: boolean = false;

  contactForm = this.fb.group({
      name:['',[Validators.required]],
      email:['',[Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]] ,
      phone:['',[Validators.required, Validators.pattern('^[\\+]?[0-9]{10,15}$')]]
  })


  toggleModal() {
    this.showModal = !this.showModal;
  }


  formSubmit()
  {
    if(this.contactForm.valid)
    {
      console.log(this.contactForm.value);
      this. showModal = false;
    }
  }
}
