import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';

@Component({
  imports: [ReactiveFormsModule,RouterLink,PublicHeader,PublicFooter],
  selector: 'app-login-form',
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {
  private fb = inject(FormBuilder);
  showPassword: boolean = false;


  loginForm = this.fb.nonNullable.group({
    email: ['', contactValidators.email],
    password: ['',contactValidators.password],
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    console.log(this.loginForm.getRawValue());
  }
}
