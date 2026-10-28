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
  isEdit:boolean = false;
  subtaskInfo: boolean = false;
  editingIndex: number | null = null;
  editedTask: string = ''; 
  isClosing = signal(false);

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
  }

  closeDialog(): void {
    if (this.isClosing()) return;
    this.isClosing.set(true);          
    setTimeout(() => {
        this.close.emit();
    }, 300);    
  }
deleteSubTask(index:number) {
      this.subtasks.splice(index,1);
    }

    subtaskEdit(index:number) {
      this.editingIndex = index;
      //this.editedTask = this.subtasks[index].task;
    }
    deleteEditTask()
    {
      this.editingIndex = null;
      this.editedTask = "";
    }

  confirmEditedTask(index:number){
    const value = this.editedTask.trim();
    if (!value) {
      return;
    }
    this.subtasks[index] = {
      ...this.subtasks[index],
      task: value
    };
    this.editingIndex = null;
    this.editedTask = '';
  }

  closeSubtask() {
    this.taskDetailForm.get('subtasks')?.reset('');
    this.subtaskInfo = false;
  }

  addSubtask() {
    const control = this.taskDetailForm.get('subtasks');
    const value = control?.value?.trim();
    if (!value) {
      return;
    }
    this.subtasks.push({task:value,done:false});
    control?.reset('');
    this.subtaskInfo = false;
  }

  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskDetailForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }
  goBackToDetailsView()
  {
    this.isEdit = false;
  }
}
