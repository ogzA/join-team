import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../services/toast.service';

/** Shows the current toast of the {@link ToastService} with a close button. */
@Component({
  imports: [AsyncPipe],
  selector: 'app-toast',
  styleUrl: './toast.scss',
  templateUrl: './toast.html',
})
export class ToastClass {
  toastService = inject(ToastService);
  /** True while the leave animation runs. */
  isLeaving = signal(false);

  /** Plays the leave animation for 300 ms, then removes the toast. */
  close(): void {
    this.isLeaving.set(true);

    setTimeout(() => {
      this.toastService.clear();
      this.isLeaving.set(false);
    }, 300);
  }
}
