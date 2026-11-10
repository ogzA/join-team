import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { Router } from '@angular/router';

export interface Profile {
  id: number;
  created_at: string;
  auth_id: string | null;
  name: string | null;
  email: string;
  role: string;
}

@Service()
export class SupabaseAuth {
  private dbService = inject(Supabase);
  private supabase = this.dbService.supabase;
  private router = inject(Router);

  async signUpNewUser(name: string, email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { name: name },
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
    } else {
      console.log('Signup success:', data);
    }

    return { data, error };
  }

  // Authentication: Login and logout functions
  async isLoggedIn() {
    const { data } = await this.supabase.auth.getUser();
    console.log('Login status:', data.user);
    return data.user !== null;
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    console.error('Login data:', data);
    if (error) {
      console.error('Login error:', error.message);
    } else {
      console.log('Login success:', data);
      this.router.navigate(['/dashboard']);
    }

    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error.message);
    } else {
      console.log('Signout success');
      //this.router.navigate(['']);
    }
  }
}
