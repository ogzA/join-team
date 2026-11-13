import { Service, signal } from '@angular/core';

/** Signup input that is kept while the user visits other page (passwords are never stored). */
export interface SignupDraftData {
  name: string;
  email: string;
  privacyPolicy: string;
}

const EMPTY_DRAFT: SignupDraftData = { name: '', email: '', privacyPolicy: '' };

/** Remembers signup input so it is still there when the user comes back to the signup page. */
@Service()
export class SignupDraft {
  /** Last saved input, empty until the user leaves the signup page. */
  readonly draft = signal<SignupDraftData>(EMPTY_DRAFT);

  /** Stores the current input. */
  save(data: SignupDraftData): void {
    this.draft.set(data);
  }

  /** Empties the draft, e.g. after a successful signup. */
  clear(): void {
    this.draft.set(EMPTY_DRAFT);
  }
}
