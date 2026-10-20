import { Validators } from '@angular/forms';

// Vor- und Nachname, nur Buchstaben (inkl. Umlaute)
// Optional ein oder mehrere Titel davor: "Dr." oder "Prof."
// Bindestrich und Apostroph innerhalb eines Namens erlaubt (z. B. "Anna-Lena O'Brien")
// Mindestens zwei Namensteile, getrennt durch Leerzeichen
// Das "u"-Flag am Ende aktiviert \p{L} (jeder Buchstabe aus jeder Sprache)
// Achtung: Gleiche Titel-Regel wie stripTitle() in name-logo.ts, bei Änderungen beides anpassen
const NAME_PATTERN = /^(?:(?:Prof|Dr)\.\s+)*\p{L}+(?:[-']\p{L}+)*(?:\s+\p{L}+(?:[-']\p{L}+)*)+$/u;

// Erlaubte internationale Endungen. Nationale Endungen (2 Buchstaben, z. B. .de, .at, .ch) sind immer erlaubt.
// Bei Bedarf hier erweitern.
const GENERIC_TLDS = ['com', 'net', 'org', 'info', 'biz', 'eu', 'io', 'dev', 'app', 'online', 'shop', 'email', 'pro'];

// E-Mail-Format: text@domain.endung
// - Keine Leerzeichen, genau ein @
// - Domain darf Subdomains (mail.web.de) und Umlaute (müller.de) enthalten
// - Endung: entweder 2 Buchstaben (national) oder aus GENERIC_TLDS
// - "i"-Flag: Groß-/Kleinschreibung egal
const EMAIL_PATTERN = new RegExp(
  String.raw`^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.(?:[a-z]{2}|${GENERIC_TLDS.join('|')})$`,
  'i',
);

// Ziffern und Leerzeichen, optional ein "+" am Anfang, muss mit einer Ziffer beginnen (z. B. "+49 176 1234567")
const PHONE_PATTERN = /^[\\+]?[0-9 ]{10,16}$/;

// Gemeinsame Validatoren für Add- und Edit-Contact-Formular
// Jedes Feld ist Pflicht und muss dem jeweiligen Muster entsprechen
export const contactValidators = {
  name: [Validators.required, Validators.pattern(NAME_PATTERN)],
  email: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
  phone: [Validators.required, Validators.pattern(PHONE_PATTERN)],
};
