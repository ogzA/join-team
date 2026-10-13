import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { contactValidators } from '../contact-validators';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-contact',
  styleUrl: './edit-contact.scss',
  templateUrl: './edit-contact.html',
})
export class EditContact {
  private fb = inject(FormBuilder);
  showModal = true; // Temporär für Layout testing

  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  // Validiert das Formular und speichert die Änderungen.
  onSave() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    // TODO: BEsprechen: supabase.updateContact(id, this.contactForm.getRawValue())
  }

  // Löscht den Kontakt
  onDelete() {
    // TODO: Besprechen supabase.deleteContact(id)
  }
}
