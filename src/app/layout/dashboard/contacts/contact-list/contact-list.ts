import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { AddContact } from '../contact-forms/add-contact/add-contact';
import { NameLogo } from '../../../../shared/services/name-logo';

@Component({
  imports: [AddContact],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  private router = inject(Router);
  dbService = inject(Supabase);
  nlService = inject(NameLogo);
  contacts = this.dbService.contacts;
  isDialogOpen = false;

  logoColor = '#939393';
  shortname = 'G';

  async ngOnInit() {
    await this.dbService.getContacts();

    // this.shortname = this.nlService.setNameLogo(this.contact.name).name;
    // this.logoColor = this.nlService.setNameLogo(this.username).color;
  }

  changeStyles(logoColor: string) {
    return `background:${logoColor}`;
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
}
