import { Component, inject } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';

@Component({
  imports: [],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  dbService = inject(Supabase);

  contacts = this.dbService.contacts;

  async ngOnInit() {
    await this.dbService.getContacts();
  }
}
