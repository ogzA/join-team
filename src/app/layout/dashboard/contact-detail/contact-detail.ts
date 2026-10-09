import { Component, inject } from '@angular/core';
import { Supabase } from '../../../shared/services/supabase';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [JsonPipe],
  selector: 'app-contact-detail',
  styleUrl: './contact-detail.scss',
  templateUrl: './contact-detail.html',
})
export class ContactDetail {
  dbService = inject(Supabase);

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
