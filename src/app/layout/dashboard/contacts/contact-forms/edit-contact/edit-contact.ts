import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../../../../shared/services/supabase';
import { contactValidators } from '../contact-validators';

type EditableContact = { id: number; name: string; email: string; phone: string };

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-contact',
  styleUrl: './edit-contact.scss',
  templateUrl: './edit-contact.html',
})
export class EditContact implements OnInit {
  private fb = inject(FormBuilder);
  private db = inject(Supabase);

  contact = input.required<EditableContact>(); // Kontakt, der bearbeitet wird (kommt aus contact-detail)
  closed = output<void>(); // Meldet contact-detail, dass der Dialog geschlossen werden soll

  isSaving = signal(false);
  errorMessage = signal('');

  // Initialen für den Avatar, z. B. "Anna Müller" -> "AM"
  initials = computed(() =>
    this.contact()
      .name.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  // Befüllt das Formular mit den Daten des ausgewählten Kontakts
  ngOnInit() {
    const { name, email, phone } = this.contact();
    this.contactForm.setValue({ name, email, phone });
  }

  // Validiert das Formular und speichert die Änderungen
  async onSave() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    await this.runAction(() =>
      this.db.updateContact(this.contact().id, this.contactForm.getRawValue()),
    );
  }

  // Löscht den Kontakt und hebt die Auswahl auf
  async onDelete() {
    await this.runAction(async () => {
      await this.db.deleteContact(this.contact().id);
      this.db.selectedContactId.set(null);
    });
  }

  // Führt eine Supabase-Aktion mit Ladezustand und Fehlerbehandlung aus
  private async runAction(action: () => Promise<void>) {
    this.isSaving.set(true);
    this.errorMessage.set('');
    try {
      await action();
      this.closed.emit();
      // TODO: Toast anzeigen, sobald es den gemeinsamen Toast gibt
    } catch {
      this.errorMessage.set('Something went wrong. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
