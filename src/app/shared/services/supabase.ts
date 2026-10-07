import { Service, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Service()
export class Supabase {
  supabseUrl = "https://lvreicyjypltqvutgvly.supabase.co";
  supabaseKey = "sb_publishable_iELLkIsUUv19dITy-f83Rw_nH8U3yof";
  supabase = createClient(this.supabseUrl, this.supabaseKey);

  contacts = signal<
    { id: number; created_at: string; name: string; email: string; phone: number; role: string }[]
  >([]);
  user = signal<
    { id: number; created_at: string; email: string; password: string; role: string }[]
  >([]);

  async getContacts() {
    let { data: contacts, error } = await this.supabase
    .from('contacts')
    .select('*');
    if (!contacts) return;
    this.contacts.set(contacts);
  }
}
