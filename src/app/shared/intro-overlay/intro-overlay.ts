import { Component, output } from '@angular/core';

/** Full-screen intro: the logo moves from the center into the header, then the overlay fades out. */
@Component({
  imports: [],
  selector: 'app-intro-overlay',
  styleUrl: './intro-overlay.scss',
  templateUrl: './intro-overlay.html',
})
export class IntroOverlay {
  /** Emits once the overlay animation has ended. */
  finished = output<void>();

  /** Reacts only to the overlay's own animation, not to the logo animations inside it. */
  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.target === event.currentTarget) {
      this.finished.emit();
    }
  }
}
