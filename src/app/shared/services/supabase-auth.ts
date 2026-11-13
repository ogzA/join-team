import { inject, Service, signal } from '@angular/core';
import { Supabase } from './supabase';
import { Router } from '@angular/router';

/** A row of the `user` table that is linked to a Supabase auth account. */
export interface Profile {
  /** Row id. */
  id: number;
  /** Creation time as ISO string. */
  created_at: string;
  /** Id of the linked Supabase auth user, `null` if not linked. */
  auth_id: string | null;
  /** Display name, `null` if not set. */
  name: string | null;
  /** Email address. */
  email: string;
  /** Role of the user. */
  role: string;
}

/** Handles signup, login (with email or as guest), logout and the login state. */
@Service()
export class SupabaseAuth {
  private dbService = inject(Supabase);
  /** Shared Supabase client of the {@link Supabase} service. */
  private supabase = this.dbService.supabase;
  private router = inject(Router);
  /** True while a user or guest is logged in. */
  loggedInStatus = signal(false);
  /** True once the mobile welcome screen of the summary page was shown after login. */
  firstMobilWelcome = signal(false);
  /** Name of the logged-in user for the header avatar, "G" for guests. */
  loggedUserName = signal('');

  /**
   * Creates a new account, stores the name in the user metadata and opens the dashboard on
   * success. Errors are logged to the console.
   *
   * @param name - Full name of the new user.
   * @param email - Email address used for login.
   * @param password - Password used for login.
   * @returns The Supabase `data` and `error` of the signup.
   */
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
      this.router.navigate(['/dashboard']);
    }

    return { data, error };
  }

  /**
   * Checks whether a user is logged in and updates {@link loggedInStatus} and
   * {@link loggedUserName}.
   *
   * @returns True if a user or guest is logged in.
   */
  async isLoggedIn() {
    const { data } = await this.supabase.auth.getUser();

    if (data.user != null) {
      this.loggedInStatus.set(true);
      if (await this.isGuest()) {
        this.loggedUserName.set('G');
      } else {
        this.loggedUserName.set(await this.getUserName());
      }
    } else this.loggedInStatus.set(false);

    return data.user !== null;
  }

  /**
   * Checks whether the current user is logged in as guest.
   *
   * @returns True for an anonymous (guest) login.
   */
  async isGuest() {
    const { data } = await this.supabase.auth.getUser();
    return data.user?.is_anonymous === true;
  }

  /**
   * Loads the name of the logged-in user from the `user` table.
   *
   * @returns The name, or an empty string if nobody is logged in or no name is stored.
   */
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

  /**
   * Logs in with email and password and opens the dashboard on success.
   * Errors are logged to the console.
   *
   * @param email - Email address of the account.
   * @param password - Password of the account.
   * @returns The Supabase `data` and `error` of the login.
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.error('Login error:', error.message);
    } else {
      this.router.navigate(['/dashboard']);
    }

    return { data, error };
  }

  /**
   * Logs in anonymously as guest and opens the dashboard on success.
   * Errors are logged to the console.
   *
   * @returns The Supabase `error`, `null` on success.
   */
  async signInAsGuest() {
    const { error } = await this.supabase.auth.signInAnonymously();

    if (error) {
      console.error('Guest login error:', error.message);
    } else {
      this.router.navigate(['/dashboard']);
    }

    return { error };
  }

  /**
   * Logs out, goes back to the login page and resets {@link loggedInStatus}.
   * Errors are logged to the console.
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error.message);
    } else {
      this.router.navigate(['/']);
      this.loggedInStatus.set(false);
    }
  }
}
