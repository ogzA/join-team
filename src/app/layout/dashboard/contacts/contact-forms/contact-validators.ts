import { Validators } from '@angular/forms';

// Vor- und Nachname, nur Buchstaben (inkl. Umlaute).
// Bindestrich und Apostroph innerhalb eines Namens erlaubt (z. B. "Anna-Lena O'Brien").
// Mindestens zwei Namensteile, getrennt durch Leerzeichen.
// Das "u"-Flag am Ende aktiviert \p{L} (jeder Buchstabe aus jeder Sprache).
const NAME_PATTERN = /^\p{L}+(?:[-']\p{L}+)*(?:\s+\p{L}+(?:[-']\p{L}+)*)+$/u;

// Einfaches E-Mail-Format: text@domain.endung
// Keine Leerzeichen, genau ein @, Endung mindestens 2 Buchstaben.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Ziffern und Leerzeichen, optional ein "+" am Anfang, muss mit einer Ziffer beginnen (z. B. "+49 176 1234567")
const PHONE_PATTERN = /^\+?[0-9 ]+$/;

// Gemeinsame Validatoren für Add- und Edit-Contact-Formular.
// Jedes Feld ist Pflicht und muss dem jeweiligen Muster entsprechen.
export const contactValidators = {
  name: [Validators.required, Validators.pattern(NAME_PATTERN)],
  email: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
  phone: [Validators.required, Validators.pattern(PHONE_PATTERN)],
};
