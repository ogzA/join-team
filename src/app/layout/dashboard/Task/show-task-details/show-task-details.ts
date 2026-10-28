import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { SelectedTask, Subtask } from '../../../../shared/models/task';
import { TitleCasePipe } from '@angular/common';

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
  subtasks: Subtask[]=[];
  assigned = signal<string[]>([]);

  selected = input.required<SelectedTask>();
  taskData = computed(() => this.selected()); 

  close = output<void>();
  
  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);


  taskDetailForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/^[A-ZÄÖÜßa-zäöüẞ][a-zäöüẞA-ZÄÖÜß0-9_ -]*$/)]],
    description: [''],
    date: ['', Validators.required],
    prio: [''],
    assigned: [''],
    subtasks: [''],
  });

  

  ngOnInit()
  {    
    console.log('Selected task data:', this.selected().task)
    const taskData = this.selected().task
    
  }

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
  onSubtaskChange(subtask: Subtask, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    subtask.done = checkbox.checked;
  }
  openDialog() {
    this.isDialogOpen = true;
  }
  closeDialog(): void {
    this.close.emit();
    this.isDialogOpen = false;
  }

}
