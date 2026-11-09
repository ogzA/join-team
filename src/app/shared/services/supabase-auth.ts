import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';

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
}
