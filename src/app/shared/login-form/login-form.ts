import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';
import { SupabaseAuth } from '../services/supabase-auth';

/** Login page with email and password login and guest login. */
@Component({
  imports: [ReactiveFormsModule, RouterLink, PublicHeader, PublicFooter],
  selector: 'app-login-form',
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {
  private fb = inject(FormBuilder);
  supabase_auth = inject(SupabaseAuth);

  /** True while the password is shown as plain text. */
  showPassword: boolean = false;
  isSaving = signal(false);

  /** Form with email and password. */
  loginForm = this.fb.nonNullable.group({
    email: ['', contactValidators.email],
    password: ['', Validators.required],
  });

  /** Shows or hides the password. */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /** Logs in as guest. */
  async guestLogin() {
    this.isSaving.set(true);
    await this.supabase_auth.signInAsGuest();
    this.isSaving.set(false);
  }

  /** Logs in with email and password; an invalid form only shows its error messages. */
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
