import { Validators } from '@angular/forms';

/**
 * One part of a name: at least two letters (any alphabet, including umlauts).
 * Hyphens and apostrophes are allowed inside, e.g. "Anna-Lena" or "O'Brien".
 * A single letter such as "A" is not a valid name part.
 */
const NAME_PART = String.raw`(?:\p{L}{2,}|\p{L}[-'’´]\p{L}+)(?:[-'’´]\p{L}+)*`;

/**
 * First and last name: an optional title "Dr." or "Prof." (any letter case), followed by at
 * least two {@link NAME_PART}s separated by spaces.
 * The "u" flag enables `\p{L}`, the "i" flag accepts e.g. "pRof."; {@link cleanContact}
 * normalizes the title before saving.
 *
 * @see NameLogo.stripTitle in name-logo.ts uses the same title rule; keep both in sync.
 */
const NAME_PATTERN = new RegExp(
  String.raw`^(?:(?:Prof|Dr)\.\s+)*${NAME_PART}(?:\s+${NAME_PART})+$`,
  'iu',
);

/**
 * Allowed generic top-level domains. Two-letter country domains (e.g. .de, .at, .ch) are always
 * allowed. Extend this list if needed.
 */
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

/**
 * Password rules:
 * - at least 8 characters
 * - at least one uppercase letter, one lowercase letter and one number
 * - at least one special character (`@$!%*?&`)
 * - only letters, numbers and these special characters, so no spaces anywhere
 */
const PASSWORD_PATTERN = new RegExp(
  String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`,
);

/**
 * Email format `text@domain.tld`:
 * - no spaces and exactly one "@"
 * - the domain may contain subdomains (mail.web.de) and umlauts (müller.de)
 * - the top-level domain has two letters (country) or is one of {@link GENERIC_TLDS}
 * - case-insensitive ("i" flag)
 */
const EMAIL_PATTERN = new RegExp(
  String.raw`^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.(?:[a-z]{2}|${GENERIC_TLDS.join('|')})$`,
  'i',
);

/**
 * Phone number: an optional leading "+", then a digit, then 9 to 15 digits or spaces,
 * e.g. "+49 176 1234567" or "0342889900".
 */
const PHONE_PATTERN = /^\+?\d[\d ]{9,15}$/;

/**
 * Shared form validators, used by the add/edit contact forms and the login form.
 * Every field is required and must match its pattern.
 */
export const contactValidators = {
  name: [Validators.required, Validators.pattern(NAME_PATTERN)],
  email: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
  phone: [Validators.required, Validators.pattern(PHONE_PATTERN)],
  password: [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
};

/**
 * Cleans up contact input before it is saved:
 * - trims all fields
 * - collapses multiple spaces in the name ("Hans    Martin" → "Hans Martin")
 * - writes titles the same way ("pRof." → "Prof.", "dr." → "Dr.")
 * - unifies apostrophe variants ("O´Brien", "O’Brien" → "O'Brien")
 *
 * @param contact - The raw form values.
 * @returns A new object with the cleaned name, email and phone.
 */
export function cleanContact(contact: { name: string; email: string; phone: string }) {
  return {
    name: contact.name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\bprof\./gi, 'Prof.')
      .replace(/\bdr\./gi, 'Dr.')
      .replace(/[’´]/g, "'"),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
  };
}


