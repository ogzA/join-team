import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule, CdkConnectedOverlay } from '@angular/cdk/overlay';
import {
  afterRenderEffect,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  model,
  input,
  DestroyRef,
  DOCUMENT,
} from '@angular/core';
import { Supabase } from '../services/supabase';
import { NameLogo } from '../services/name-logo';

/**
 * Multi-select dropdown for assigning contacts to a task, with the avatars of the selected
 * contacts below it. Built on the combobox and listbox of Angular Aria.
 */
@Component({
  selector: 'app-assigned-to-dropdown',
  templateUrl: './assigned-to-dropdown.html',
  styleUrl: './assigned-to-dropdown.scss',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class AssignedToDropdown {
  dbService = inject(Supabase);
  readonly nlService = inject(NameLogo);

  /** The combobox listbox popup. */
  readonly listbox = viewChild(Listbox);

  /** The overlay that positions the popup next to the combobox. */
  private readonly overlay = viewChild(CdkConnectedOverlay);

  /** The contacts available in the listbox. */
  readonly contacts = this.dbService.contacts;
  /** The names of the selected contacts. */
  readonly assigned = model<string[]>([]);

  /** Maximum height of the popup as a CSS length. */
  readonly popupMaxHeight = input('250px');

  /** The string that is displayed in the combobox. */
  readonly displayValue = computed(() => {
    const names = this.assigned();

    if (names.length === 0) {
      return 'Select contacts to assign';
    }
    if (names.length === 1) {
      return names[0];
    }
    return `${names[0]} + ${names.length - 1} more`;
  });
  /** Whether the popup is expanded. */
  readonly popupExpanded = signal(false);
  /** Maximum number of avatars shown below the dropdown, the rest is shown as "+N". */
  readonly maxAvatars = 3;

  /**
   * Scrolls to the active option whenever it changes and closes the popup when something
   * outside of it is scrolled.
   */
  constructor() {
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });

    const document = inject(DOCUMENT);

    const onScroll = (event: Event) => {
      if (!this.popupExpanded()) return;

      const target = event.target;

      if (target instanceof Element && target.closest('.example-popup-container')) return;

      this.popupExpanded.set(false);
    };

    document.addEventListener('scroll', onScroll, true);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('scroll', onScroll, true));
  }

  /** Reloads the contacts from Supabase. */
  async ngOnInit(): Promise<void> {
    await this.dbService.getContacts();
  }
}
