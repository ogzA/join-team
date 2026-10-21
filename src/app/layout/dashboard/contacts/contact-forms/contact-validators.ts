import { Validators } from '@angular/forms';

// Vor- und Nachname, nur Buchstaben (inkl. Umlaute)
// Optional ein oder mehrere Titel davor: "Dr." oder "Prof."
// Bindestrich und Apostroph innerhalb eines Namens erlaubt (z. B. "Anna-Lena O'Brien")
// Mindestens zwei Namensteile, getrennt durch Leerzeichen
// Das "u"-Flag am Ende aktiviert \p{L} (jeder Buchstabe aus jeder Sprache)
// Achtung: Gleiche Titel-Regel wie stripTitle() in name-logo.ts, bei Änderungen beides anpassen
// Das "i"-Flag erlaubt Titel in beliebiger Schreibweise (z. B. "pRof."), cleanContact() vereinheitlicht sie beim Speichern
const NAME_PATTERN = /^(?:(?:Prof|Dr)\.\s+)*\p{L}+(?:[-']\p{L}+)*(?:\s+\p{L}+(?:[-']\p{L}+)*)+$/iu;

// Erlaubte internationale Endungen. Nationale Endungen (2 Buchstaben, z. B. .de, .at, .ch) sind immer erlaubt.
// Bei Bedarf hier erweitern.
const GENERIC_TLDS = [
  'com',
  'net',
  'org',
  'info',
  'biz',
  'eu',
  'io',
  'dev',
  'app',
  'online',
  'shop',
  'email',
  'pro',
];

// E-Mail-Format: text@domain.endung
// - Keine Leerzeichen, genau ein @
// - Domain darf Subdomains (mail.web.de) und Umlaute (müller.de) enthalten
// - Endung: entweder 2 Buchstaben (national) oder aus GENERIC_TLDS
// - "i"-Flag: Groß-/Kleinschreibung egal
const EMAIL_PATTERN = new RegExp(
  String.raw`^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.(?:[a-z]{2}|${GENERIC_TLDS.join('|')})$`,
  'i',
);

// Telefonnummer: optional "+" am Anfang, dann eine Ziffer, danach Ziffern oder Leerzeichen
// Insgesamt 10 bis 16 Zeichen (z. B. "+49 176 1234567", "0342889900")
const PHONE_PATTERN = /^\+?\d[\d ]{9,15}$/;

// Gemeinsame Validatoren für Add- und Edit-Contact-Formular
// Jedes Feld ist Pflicht und muss dem jeweiligen Muster entsprechen
export const contactValidators = {
  name: [Validators.required, Validators.pattern(NAME_PATTERN)],
  email: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
  phone: [Validators.required, Validators.pattern(PHONE_PATTERN)],
};

// Bereinigt Eingaben vor dem Speichern:
// - Leerzeichen am Anfang und Ende entfernen
// - Mehrere Leerzeichen zu einem zusammenfassen ("Hans    Martin" → "Hans Martin")
// - Titel einheitlich schreiben ("pRof." → "Prof.", "dr." → "Dr.")
export function cleanContact(contact: { name: string; email: string; phone: string }) {
  return {
    name: contact.name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\bprof\./gi, 'Prof.')
      .replace(/\bdr\./gi, 'Dr.'),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
  };
}
