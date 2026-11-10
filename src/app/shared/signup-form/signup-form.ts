import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { RouterLink } from '@angular/router';
import { SupabaseAuth } from '../services/supabase-auth';

@Component({
  imports: [ReactiveFormsModule, PublicHeader, PublicFooter, RouterLink],
  selector: 'app-signup-form',
  styleUrl: './signup-form.scss',
  templateUrl: './signup-form.html',
})
export class SignupForm {
  private fb = inject(FormBuilder);

  supabase_auth = inject(SupabaseAuth);

  signupForm = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
    confirmPassword: [''],
    privacyPolicy: [false],
  });

  async onSubmit() {
    if (this.signupForm.invalid) {
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
