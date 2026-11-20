import { inject, Service, signal } from '@angular/core';
import { Supabase } from './supabase';
import { Router } from '@angular/router';

const DUMMY_PHONE = '+49 000 0000000';

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
  /** Email of the logged-in user, empty if logged out or guest. */
  loggedUserEmail = signal('');

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
      this.loggedUserEmail.set(data.user.email ?? '');
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

  /**  Dummy contacts can be edited and deleted by everyone, user contacts only by the user themselves. */
  canChangeContact(contact: { role: string; email: string }): boolean {
    if (contact.role === 'dummy') return true;
    return this.loggedUserEmail() !== '' && contact.email === this.loggedUserEmail();
  }

  /**
   * Checks whether the contact belongs to the logged-in user.
   *
   * @param contact - Contact with role and email.
   * @returns True for the user's own contact.
   */
  isOwnContact(contact: { role: string; email: string }): boolean {
    return (
      contact.role === 'user' &&
      this.loggedUserEmail() !== '' &&
      contact.email === this.loggedUserEmail()
    );
  }

  /**
   * Deletes the own contact, user entry and login. Logs out first, because a logout after the
   * login was deleted fails with 403; the access token stays valid for the deletion.
   */
  async deleteOwnAccount() {
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('No session');
    await this.signOut();
    await this.deleteAccountWithToken(token);
  }

  /**
   * Calls the database function `delete_own_account` with the given access token.
   *
   * @param token - Access token of the user to delete.
   */
  private async deleteAccountWithToken(token: string) {
    const response = await fetch(`${this.dbService.supabseUrl}/rest/v1/rpc/delete_own_account`, {
      method: 'POST',
      headers: {
        apikey: this.dbService.supabaseKey,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!response.ok) throw new Error('Account could not be deleted');
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

    if (!error) this.router.navigate(['/dashboard']);
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
      this.loggedUserEmail.set('');
    }
  }
}
