import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';
import { Supabase } from '../services/supabase';

@Component({
  imports: [ReactiveFormsModule,RouterLink,PublicHeader,PublicFooter],
  selector: 'app-login-form',
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {
  private fb = inject(FormBuilder);
  supabase = inject(Supabase)

  showPassword: boolean = false;


  loginForm = this.fb.nonNullable.group({
    email: ['', contactValidators.email],
    password: ['',contactValidators.password],
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    console.log(this.loginForm);
    await this.supabase.signInWithEmail(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? ''
    );
    console.log(this.loginForm.getRawValue());
  }
}
