import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';


@Component({
  imports: [],
  selector: 'app-login-form',
  styleUrl: './login-form.scss',
  templateUrl: './login-form.html',
})
export class LoginForm {
  private fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(/\S/)]],
    password: ['',Validators.required]
  });


  onSubmit(){

  }
}
