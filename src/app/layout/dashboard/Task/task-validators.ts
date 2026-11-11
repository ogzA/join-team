import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Returns today's date as yyyy-mm-dd in local time. */
export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gives an error when the date is before today.
 * @param allowedDate Optional function that returns a date that stays valid,
 * e.g. the original date of an edited task.
 */
export function noPastDate(allowedDate?: () => string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value || value >= getTodayDate() || value === allowedDate?.()) return null;
    return { pastDate: true };
  };
}
