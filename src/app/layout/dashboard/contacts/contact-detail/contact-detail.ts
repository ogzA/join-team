import { Component, inject } from '@angular/core';
import { NameLogo } from '../../../../shared/services/name-logo';
import { Supabase } from '../../../../shared/services/supabase';

@Component({
  imports: [],
  selector: 'app-contact-detail',
  styleUrl: './contact-detail.scss',
  templateUrl: './contact-detail.html',
})
export class ContactDetail {
  dbService = inject(Supabase);
  nlService = inject(NameLogo);

  logoColor = '#939393';
  shortname = 'G';
  username = 'Guest';

  contact = {
    name: 'Guest',
    email: '',
    phone: '',
  };

  ngOnInit() {
    setTimeout(() => {
      this.username = this.dbService.contacts()[this.dbService.id().id].name;
      this.shortname = this.nlService.setNameLogo(this.username).name;
      this.logoColor = this.nlService.setNameLogo(this.username).color;

      this.contact.name = this.dbService.contacts()[this.dbService.id().id].name;
      this.contact.email = this.dbService.contacts()[this.dbService.id().id].email;
      this.contact.phone = this.dbService.contacts()[this.dbService.id().id].phone;
    }, 2000);

    // console.log('Test: ', this.username, this.shortname, this.logoColor);

    // requestAnimationFrame(() => this.ngOnInit());
    // console.log(this.dbService.id().id);
    // console.log(this.dbService.contacts());
    // this.changeNameLogo('detailLogo', username);
  }

  editContact() {
    //Open Dialog später
    console.log('Open Dialog folgt... Test');
  }

  deleteContact() {
    //Delete später vom Supabase Service
    console.log('Delete Methode folgt... Test');
  }

  // isNumber(value: any) {
  //   return !isNaN(parseFloat(value)) && isFinite(value);
  // }
}
