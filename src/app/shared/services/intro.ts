import { Service, signal } from '@angular/core';

/** Remembers whether the logo intro has already been played. */
@Service()
export class Intro {
    /** True after the intro ran once, reset on logout to play it again. */
    readonly played = signal(false);

    /** Marks the intro as played. */
    markPlayed(): void {
        this.played.set(true);
    }

    /** Lets the intro play again on the next public page (after logout). */
    reset(): void {
        this.played.set(false);
    }
}
