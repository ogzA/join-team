import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

@Service()
export class ToastService {
    private toastSubject = new BehaviorSubject<ToastMessage | null>(null); 
    toast$ = this.toastSubject.asObservable();
    private timeoutId?: ReturnType<typeof setTimeout>;
    private toastId = 0;

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

    success(message: string, duration = 3000): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 4000): void {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration = 3000): void {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration = 3000): void {
        this.show(message, 'info', duration);
    }

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