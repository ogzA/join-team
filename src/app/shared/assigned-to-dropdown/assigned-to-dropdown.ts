import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  afterRenderEffect,
  Component,
  computed,
  inject,
  signal,
  viewChild,
  model,
} from '@angular/core';
import { Supabase } from '../services/supabase';
import { NameLogo } from '../services/name-logo';

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
  /** The contacts available in the listbox. */
  readonly contacts = this.dbService.contacts;
  /** The ids of the selected contacts. */
  readonly assigned = model<string[]>([]);

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

  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.dbService.getContacts();
  }
}
