import { Service, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Service()
export class Supabase {
  supabseUrl = "https://lvreicyjypltqvutgvly.supabase.co";
  supabaseKey = "sb_publishable_iELLkIsUUv19dITy-f83Rw_nH8U3yof";
  supabase = createClient(this.supabseUrl, this.supabaseKey);

  // Für Datentypen am besten später Interfaces einbauen
  contacts = signal<{ id: number, created_at: string, name: string, email: string, phone: number, role: string }[]>([]);
  user = signal<{ id: number, created_at: string, email: string, password: string, role: string }[]>([]);

  async getContacts() {
    let { data: contacts, error } = await this.supabase
    .from('contacts')
    .select('*');
    if (!contacts) return;
    this.contacts.set(contacts);
  }

  async getUser() {
    let { data: user, error } = await this.supabase
    .from('user')
    .select('*');
    if (!user) return;
    this.user.set(user);
  }

  async setContact(contact:{name: string, email: string, phone: number, role: string}){
    const {data, error}= await this.supabase
    .from('contacts')
    .insert([contact])
    .select()
  }

  async setUser(user:{email: string, password: string, role: string}){
    const {data, error}= await this.supabase
    .from('user')
    .insert([user])
    .select()
  }

  async updateContact(id:number){
    const {data:error} = await this.supabase
    .from('contacts')
    //Bei Update später mit Input Eingaben jenachdem was angepasst werden soll mit Parameter Übergabe
    .update({name: "Neuer Wert"})
    .eq('id',id)
    .select()
  }

  async updateUser(id:number){
    const {data:error} = await this.supabase
    .from('user')
    //Bei Update später mit Input Eingaben jenachdem was angepasst werden soll mit Parameter Übergabe
    .update({name: "Neuer Wert"})
    .eq('id',id)
    .select()
  }

  async deleteContact(id:number){
    const {data:error} = await this.supabase
    .from('contacts')
    .delete()
    .eq('id',id)
  }

  async deleteUser(id:number){
    const {data:error} = await this.supabase
    .from('user')
    .delete()
    .eq('id',id)
  }
}
