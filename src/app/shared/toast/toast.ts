import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  imports: [AsyncPipe],
  selector: 'app-toast',
  styleUrl: './toast.scss',
  templateUrl: './toast.html',
})
export class ToastClass {
  toastService = inject(ToastService);
  isLeaving = signal(false);

  close(): void {
    this.isLeaving.set(true);

    setTimeout(() => {
      this.toastService.clear();
      this.isLeaving.set(false);
    }, 300);
  }
}
