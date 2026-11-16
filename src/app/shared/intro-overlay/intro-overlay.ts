import { Component, output } from '@angular/core';

/** Full-screen intro: the logo moves from the center to the header, then the overlay fades out. */
@Component({
  imports: [],
  selector: 'app-intro-overlay',
  styleUrl: './intro-overlay.scss',
  templateUrl: './intro-overlay.html',
})
export class IntroOverlay {
  /** Emits once the overlay animation has ended. */
  finished = output<void>();

  /**
   * Emits {@link finished} when the overlay's own animation ends. The animation ends of the
   * logos inside it bubble up too and are ignored.
   *
   * @param event - The `animationend` event.
   */
  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.target === event.currentTarget) {
      this.finished.emit();
    }
  }
}
