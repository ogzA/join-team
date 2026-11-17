import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PublicHeader } from '../public-header/public-header';
import { PublicFooter } from '../public-footer/public-footer';
import { RouterLink } from '@angular/router';
import { contactValidators } from '../../layout/dashboard/contacts/contact-forms/contact-validators';

import { SupabaseAuth } from '../services/supabase-auth';
import { SignupDraft } from '../services/signup-draft';

/** Signup page with name, email, password, password confirmation and privacy checkbox. */
@Component({
  imports: [ReactiveFormsModule, PublicHeader, PublicFooter, RouterLink],
  selector: 'app-signup-form',
  styleUrl: './signup-form.scss',
  templateUrl: './signup-form.html',
})
export class SignupForm {
  private fb = inject(FormBuilder);
  /** True while the password is shown as plain text. */
  showPassword: boolean = false;
  /** True while the password confirmation is shown as plain text. */
  showConfirmPassword: boolean = false;

  supabase_auth = inject(SupabaseAuth);
  private draft = inject(SignupDraft);

  /** Signup fields; all are required and the email must be valid. */
  signupForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/\S/)]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    privacyPolicy: ['', Validators.required],
  });

  /** Restores name, email and privacy checkbox from the {@link SignupDraft}. */
  constructor() {
    this.signupForm.patchValue(this.draft.draft());
  }

  /**
   * Saves name, email and privacy checkbox in the {@link SignupDraft}, so they are still there
   * after a visit to the privacy policy. Passwords are not saved.
   */
  ngOnDestroy() {
    const { name, email, privacyPolicy } = this.signupForm.getRawValue();
    this.draft.save({ name, email, privacyPolicy });
  }

  /** Shows or hides the password. */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  /** Shows or hides the password confirmation. */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  /** True if the password and its confirmation are different. */
  get passwordsDoNotMatch(): boolean {
    const password = this.signupForm.controls.password.value;
    const confirmPassword = this.signupForm.controls.confirmPassword.value;

    return password !== confirmPassword;
  }
  /**
   * Signs up the new user. An invalid form or different passwords only show the error
   * messages. If the email is already taken or the password is too weak, that field gets an
   * error. On success {@link SupabaseAuth.signUpNewUser} opens the dashboard, and the form and
   * the draft are cleared.
   */
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
      if (error.code === 'weak_password') {
        const passwordControl = this.signupForm.controls.password;
        passwordControl.setErrors({ passwordTaken: true });
        passwordControl.markAllAsTouched();
      }
      return;
    }
    this.signupForm.reset();
    this.draft.clear();
  }
}
