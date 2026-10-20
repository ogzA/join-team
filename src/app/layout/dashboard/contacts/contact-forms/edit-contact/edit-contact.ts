import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Supabase } from '../../../../../shared/services/supabase';
import { contactValidators } from '../contact-validators';
import { NameLogo } from '../../../../../shared/services/name-logo';
import { ToastService } from '../../../../../shared/services/toast.service';

type EditableContact = { id: number; name: string; email: string; phone: string };

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-edit-contact',
  styleUrl: './edit-contact.scss',
  templateUrl: './edit-contact.html',
})
export class EditContact implements OnInit {
  private fb = inject(FormBuilder);
  private nlService = inject(NameLogo);
  private db = inject(Supabase);
  private toast = inject(ToastService);

  contact = input.required<EditableContact>(); // Kontakt, der bearbeitet wird (kommt aus contact-detail)
  closed = output<void>(); // Meldet contact-detail, dass der Dialog geschlossen werden soll

  isSaving = signal(false);
  errorMessage = signal('');

  // Kürzel und Farbe für den Avatar, wie in der Detailansicht
  avatar = computed(() => this.nlService.setNameLogo(this.contact().name));

  contactForm = this.fb.nonNullable.group({
    name: ['', contactValidators.name],
    email: ['', contactValidators.email],
    phone: ['', contactValidators.phone],
  });

  // Befüllt das Formular mit den Daten des ausgewählten Kontakts
  ngOnInit() {
    const { name, email, phone } = this.contact();
    this.contactForm.setValue({ name, email, phone });
    this.contactForm.markAllAsTouched(); // Fehler in bestehenden Daten sofort anzeigen
  }

  // Validiert das Formular und speichert die Änderungen
  async onSave() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    await this.runAction(
      () => this.db.updateContact(this.contact().id, this.contactForm.getRawValue()),
      'Contact successfully updated',
    );
  }

  // Löscht den Kontakt und hebt die Auswahl auf
  async onDelete() {
    await this.runAction(async () => {
      await this.db.deleteContact(this.contact().id);
      this.db.selectedContactId.set(null);
    }, 'Contact successfully deleted');
  }

  // Führt eine Supabase-Aktion mit Ladezustand und Fehlerbehandlung aus
  private async runAction(action: () => Promise<void>, successMessage: string) {
    this.isSaving.set(true);
    this.errorMessage.set('');
    try {
      await action();
      this.closed.emit();
      this.toast.success(successMessage);
    } catch {
      this.errorMessage.set('Something went wrong. Please try again.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
