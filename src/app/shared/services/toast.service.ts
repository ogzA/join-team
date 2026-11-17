import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Visual style of a toast. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** A toast that is currently shown. */
export interface ToastMessage {
    /** Unique id, used to clear only this toast. */
    id: number;
    /** Text shown in the toast. */
    message: string;
    /** Visual style of the toast. */
    type: ToastType;
}

/** Shows one toast at a time and hides it automatically after a given duration. */
@Service()
export class ToastService {
    /** Holds the current toast, `null` when no toast is shown. */
    private toastSubject = new BehaviorSubject<ToastMessage | null>(null); 
    /** Emits the current toast, or `null` when it is hidden. */
    toast$ = this.toastSubject.asObservable();
    /** Timer that hides the current toast. */
    private timeoutId?: ReturnType<typeof setTimeout>;
    /** Counter for the toast ids. */
    private toastId = 0;

    /**
     * Shows a toast and replaces the one that is currently shown.
     *
     * @param message - Text of the toast.
     * @param type - Visual style of the toast.
     * @param duration - Time in milliseconds until the toast is hidden.
     */
    show(message: string, type: ToastType = 'success', duration = 3000): void {
        if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        }

        const toast: ToastMessage = {
        id: ++this.toastId,
        message,
        type,
        };

        this.toastSubject.next(toast);

        this.timeoutId = setTimeout(() => {
        this.clear(toast.id);
        }, duration);
    }

    /**
     * Shows a success toast.
     *
     * @param message - Text of the toast.
     * @param duration - Time in milliseconds until the toast is hidden.
     */
    success(message: string, duration = 3000): void {
        this.show(message, 'success', duration);
    }

    /**
     * Shows an error toast. It stays a bit longer by default.
     *
     * @param message - Text of the toast.
     * @param duration - Time in milliseconds until the toast is hidden.
     */
    error(message: string, duration = 4000): void {
        this.show(message, 'error', duration);
    }

    /**
     * Shows a warning toast.
     *
     * @param message - Text of the toast.
     * @param duration - Time in milliseconds until the toast is hidden.
     */
    warning(message: string, duration = 3000): void {
        this.show(message, 'warning', duration);
    }

    /**
     * Shows an info toast.
     *
     * @param message - Text of the toast.
     * @param duration - Time in milliseconds until the toast is hidden.
     */
    info(message: string, duration = 3000): void {
        this.show(message, 'info', duration);
    }

    /**
     * Hides the current toast and stops its timer.
     *
     * @param id - If given, the toast is only hidden when it is still the current one.
     */
    clear(id?: number): void {
        const currentToast = this.toastSubject.value;

        if (id !== undefined && currentToast?.id !== id) {
        return;
        }

        if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
        }

        this.toastSubject.next(null);
    }
}