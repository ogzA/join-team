import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { RouterLink } from '@angular/router';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';

import { SupabaseAuth } from '../services/supabase-auth';

@Component({
  imports: [ReactiveFormsModule, PublicHeader, PublicFooter, RouterLink],
  selector: 'app-signup-form',
  styleUrl: './signup-form.scss',
  templateUrl: './signup-form.html',
})
export class SignupForm {
  private fb = inject(FormBuilder);
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  supabase_auth = inject(SupabaseAuth);

  signupForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    privacyPolicy: ['', Validators.required],
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  get passwordsDoNotMatch(): boolean {
    const password = this.signupForm.controls.password.value;
    const confirmPassword = this.signupForm.controls.confirmPassword.value;

    return password !== confirmPassword;
  }
  async onSubmit() {
    if (this.signupForm.invalid || this.passwordsDoNotMatch) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.signupForm.getRawValue();

    const { error } = await this.supabase_auth.signUpNewUser(name, email, password);

    if (error) {
      if (error.code === 'user_already_exists' || error.code === 'email_exists') {
        const emailControl = this.signupForm.controls.email;
        emailControl.setErrors({ emailTaken: true });
        emailControl.markAllAsTouched();
      }
      return;
    }
    this.signupForm.reset();
  }
}
