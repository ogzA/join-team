import { inject, Service, signal } from '@angular/core';
import { Supabase } from './supabase';
import { Router } from '@angular/router';

const DUMMY_PHONE = '+49 000 0000000';

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
  loggedInStatus = signal(false);
  firstMobilWelcome = signal(false);

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
      await this.addUserAsContact(name, email);
    }

    return { data, error };
  }

  private async addUserAsContact(name: string, email: string) {
    try {
      await this.dbService.setContact({
        name: name,
        email: email,
        phone: DUMMY_PHONE,
        role: 'user',
      });
    } catch (contactError) {
      console.error('Contact for new user not created:', contactError);
    }
  }

  // Authentication: Login and logout functions
  async isLoggedIn() {
    const { data } = await this.supabase.auth.getUser();

    if (data.user != null) {
      this.loggedInStatus.set(true);
    } else this.loggedInStatus.set(false);

    return data.user !== null;
  }

  async isGuest() {
    const { data } = await this.supabase.auth.getUser();
    return data.user?.is_anonymous === true;
  }

  // User Name nach Login
  async getUserName(): Promise<string> {
    const { data: authData } = await this.supabase.auth.getUser();
    if (!authData.user) return '';

    const { data } = await this.supabase
      .from('user')
      .select('name')
      .eq('auth_id', authData.user.id)
      .maybeSingle();

    return data?.name ?? '';
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    console.log('Login data:', data);
    if (error) {
      console.error('Login error:', error.message);
    } else {
      console.log('Login success:', data);
      this.router.navigate(['/dashboard']);
    }

    return { data, error };
  }

  async signInAsGuest() {
    const { error } = await this.supabase.auth.signInAnonymously();

    if (error) {
      console.error('Guest login error:', error.message);
    } else {
      this.router.navigate(['/dashboard']);
    }

    return { error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error.message);
    } else {
      console.log('Signout success');
      this.router.navigate(['/']);
    }
  }
}
