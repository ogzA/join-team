import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { SelectedTask, Subtask } from '../../../../shared/models/task';
import { TitleCasePipe } from '@angular/common';
import { NameLogo } from '../../../../shared/services/name-logo';

@Component({
  imports: [ReactiveFormsModule,AssignedToDropdown,TitleCasePipe],
  selector: 'app-show-task-details',
  styleUrl: './show-task-details.scss',
  templateUrl: './show-task-details.html',
})
export class ShowTaskDetails {
  isDialogOpen: boolean = false;
  isEdit:boolean = false;
  subtaskInfo: boolean = false;
  editingIndex: number | null = null;
  editedTask: string = ''; 

  priorityLogos = {
  low: "assets/icons/prio-low.svg",
  medium: "assets/icons/prio-medium.svg",
  urgent: "assets/icons/prio-urgent.svg",
  };

  subtasks: Subtask[]=[];
  assigned = signal<string[]>([]);

  selected = input.required<SelectedTask>();
  taskData = computed(() => this.selected()); 

  close = output<void>();

  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);
  protected nlService = inject(NameLogo);


  taskDetailForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/^[A-ZÄÖÜßa-zäöüẞ][a-zäöüẞA-ZÄÖÜß0-9_ -]*$/)]],
    description: [''],
    date: ['', Validators.required],
    prio: [''],
    assigned: [''],
    subtasks: [''],
  });

  
  async onSubmit()
  {

  }

  deleteTask()
  {
    
  }

  editTask()
  {
    this.isEdit = true;
  }

  toggleSubtask(event: Event): void {
    const done = (event.target as HTMLInputElement).checked;
    //this.done = checkbox.checked;
    
  }

  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog(): void {
    this.close.emit();
    this.isDialogOpen = false;
  }

}
