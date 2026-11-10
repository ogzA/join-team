import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { RouterLink } from '@angular/router';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';


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

  signupForm = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/\S/)]],
    password: ['',contactValidators.password],
    confirmPassword: ['',contactValidators.password],
    privacyPolicy: [false],
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility(){
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  get passwordsDoNotMatch(): boolean {
    const password = this.signupForm.controls.password.value;
    const confirmPassword = this.signupForm.controls.confirmPassword.value;

    return password !== confirmPassword;
  }
  onSubmit() {
    if (this.signupForm.invalid || this.passwordsDoNotMatch) {
      this.signupForm.markAllAsTouched();
      return;
    }
    console.log(this.signupForm.getRawValue());
  }
}
