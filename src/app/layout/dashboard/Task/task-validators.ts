import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Returns today's date in local time.
 *
 * @returns Today's date as `YYYY-MM-DD`.
 */
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates a validator that reports an error when the date is before today.
 *
 * @param allowedDate - Optional function returning a date that stays valid even if it is in the
 * past, e.g. the original date of an edited task.
 * @returns A validator that returns `{ pastDate: true }` for past dates, otherwise `null`.
 */
export function noPastDate(allowedDate?: () => string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value || value >= getTodayDate() || value === allowedDate?.()) return null;
    return { pastDate: true };
  };
}
