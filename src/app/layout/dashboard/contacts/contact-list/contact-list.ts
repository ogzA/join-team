import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AddContact } from '../add-contact/add-contact';


@Component({
  imports: [AddContact],
  selector: 'app-contact-list',
  styleUrl: './contact-list.scss',
  templateUrl: './contact-list.html',
})
export class ContactList {
  private router = inject(Router);
  isDialogOpen = false;

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }
}
