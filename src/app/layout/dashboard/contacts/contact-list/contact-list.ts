import { Component, inject} from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { AddContact } from '../contact-forms/add-contact/add-contact';

@Component({
  imports: [AddContact],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  private router = inject(Router);
  dbService = inject(Supabase);
  contacts = this.dbService.contacts;
  isDialogOpen = false;

  async ngOnInit() {
    await this.dbService.getContacts();
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
}
