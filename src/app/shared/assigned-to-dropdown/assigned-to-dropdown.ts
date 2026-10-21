import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  afterRenderEffect,
  Component,
  computed,
  signal,
  viewChild,
  effect,
  inject,
} from '@angular/core';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-assigned-to-dropdown',
  templateUrl: './assigned-to-dropdown.html',
  styleUrl: './assigned-to-dropdown.scss',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, OverlayModule],
})
export class AssignedToDropdown {
  dbService = inject(Supabase);

  /** The combobox listbox popup. */
  readonly listbox = viewChild(Listbox);
  /** The options available in the listbox. */
  readonly selectedValues = signal<string[]>([]);

  readonly contacts = this.dbService.contacts;
  /** The string that is displayed in the combobox. */
  readonly displayValue = computed(() => {
    const values = this.selectedValues();
    if (values.length === 0) {
      return 'Select a label';
    }
    if (values.length === 1) {
      return values[0];
    }
    return `${values[0]} + ${values.length - 1} more`;
  });
  /** The labels that are available for selection. */
  readonly labels = [
    { value: 'Important', icon: 'label' },
    { value: 'Starred', icon: 'star' },
    { value: 'Work', icon: 'work' },
    { value: 'Personal', icon: 'person' },
    { value: 'To Do', icon: 'checklist' },
    { value: 'Later', icon: 'schedule' },
    { value: 'Read', icon: 'menu_book' },
    { value: 'Travel', icon: 'flight' },
  ];
  /** Whether the popup is expanded. */
  readonly popupExpanded = signal(false);
  constructor() {
    // Scrolls to the active item when the active option changes.
    afterRenderEffect(() => {
      this.listbox()?.scrollActiveItemIntoView();
    });
  }
}
