import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, PublicHeader, PublicFooter, RouterLink],
  selector: 'app-signup-form',
  styleUrl: './signup-form.scss',
  templateUrl: './signup-form.html',
})
export class SignupForm {

  private fb = inject(FormBuilder);

  signupForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    console.log(this.signupForm.getRawValue());
  }
}
