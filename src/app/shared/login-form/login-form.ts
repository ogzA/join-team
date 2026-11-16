import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';
import { SupabaseAuth } from '../services/supabase-auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink, PublicHeader, PublicFooter],
  selector: 'app-login-form',
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {
  private fb = inject(FormBuilder);
  supabase_auth = inject(SupabaseAuth);

  showPassword: boolean = false;
  isSaving = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', contactValidators.email],
    password: ['', Validators.required],
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async guestLogin() {
    this.isSaving.set(true);
    await this.supabase_auth.signInAsGuest();
    this.isSaving.set(false);
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const { email, password } = this.loginForm.getRawValue();
    const { error } = await this.supabase_auth.signInWithEmail(email, password);
    this.isSaving.set(false);
    if (error) this.loginForm.setErrors({ invalidLogin: true });
  }
}
