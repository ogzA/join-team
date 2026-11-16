import { Component, inject } from '@angular/core';
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
    await this.supabase_auth.signInAsGuest();
  }

  /** Logs in with email and password; an invalid form only shows its error messages. */
  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    await this.supabase_auth.signInWithEmail(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? '',
    );
  }
}
