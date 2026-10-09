import { Service, signal, WritableSignal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

interface Contact {
  name: string;
  email: string;
  phone: number;
  role: string;
}

interface User {
  email: string;
  password: string;
  role: string;
}

@Service()
export class Supabase {
  supabseUrl = 'https://lvreicyjypltqvutgvly.supabase.co';
  supabaseKey = 'sb_publishable_iELLkIsUUv19dITy-f83Rw_nH8U3yof';
  supabase = createClient(this.supabseUrl, this.supabaseKey);

  // Für Datentypen am besten später Interfaces einbauen
  contacts = signal<
    { id: number; created_at: string; name: string; email: string; phone: number; role: string }[]
  >([]);
  user = signal<
    { id: number; created_at: string; email: string; password: string; role: string }[]
  >([]);

  // Number Typ später
  id = signal({ id: -1 });

  channels: RealtimeChannel | undefined;

  loadData() {
    this.getContacts();
    this.getUser();

    this.channels = this.supabase
      .channel('changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          console.log(payload);
          let tmpContact = payload.new as Contact;
          console.log(tmpContact);
          // this.setContact(tmpContact); //Noch fehlerhaft, da id und zeitstempel noch mit dabei
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user',
        },
        (payload) => {
          console.log(payload);
          let tmpUser = payload.new as User;
          console.log(tmpUser);
          // this.setUser(tmpUser); //Noch fehlerhaft, da id und zeitstempel noch mit dabei
        },
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.channels) this.supabase.removeChannel(this.channels);
  }

  async getContacts() {
    let response = await this.supabase.from('contacts').select('*');
    if (!response) return;
    this.contacts.set(response.data ?? ([] as Contact[]));
  }

  async getUser() {
    let response = await this.supabase.from('user').select('*');
    if (!response) return;
    this.user.set(response.data ?? ([] as User[]));
  }

  async setContact(contact: { name: string; email: string; phone: number; role: string }) {
    const { data, error } = await this.supabase.from('contacts').insert([contact]).select();
  }

  async setUser(user: { email: string; password: string; role: string }) {
    const { data, error } = await this.supabase.from('user').insert([user]).select();
  }

  async updateContact(id: number) {
    const { data: error } = await this.supabase
      .from('contacts')
      //Bei Update später mit Input Eingaben jenachdem was angepasst werden soll mit Parameter Übergabe
      .update({ name: 'Neuer Wert' })
      .eq('id', id)
      .select();
  }

  async updateUser(id: number) {
    const { data: error } = await this.supabase
      .from('user')
      //Bei Update später mit Input Eingaben jenachdem was angepasst werden soll mit Parameter Übergabe
      .update({ name: 'Neuer Wert' })
      .eq('id', id)
      .select();
  }

  async deleteContact(id: number) {
    const { data: error } = await this.supabase.from('contacts').delete().eq('id', id);
  }

  async deleteUser(id: number) {
    const { data: error } = await this.supabase.from('user').delete().eq('id', id);
  }
}
