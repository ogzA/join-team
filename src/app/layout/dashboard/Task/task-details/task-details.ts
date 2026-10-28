import { Component, inject, input, output, signal } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';

interface SUBTASK {
  task: string;
  done: boolean;
}

@Component({
  imports: [ReactiveFormsModule,AssignedToDropdown],
  selector: 'app-task-details',
  styleUrl: './task-details.scss',
  templateUrl: './task-details.html',
})
export class TaskDetails {
  isDialogOpen: boolean = false;
  isEdit:boolean = false;
  subtaskInfo: boolean = false;
  editingIndex: number | null = null;
  editedTask: string = ''; 
  assigned = signal<string[]>([]);
  SelectedTask = signal<string[]>([]);
  
  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);
  subtasks: SUBTASK[] = [
      {
        task: 'Implement Recipe Recommendation',
        done: true
      },
      {
        task: 'Start Page Layout',
        done: false
      }
    ];


  taskDetailForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/^[A-ZÄÖÜßa-zäöüẞ][a-zäöüẞA-ZÄÖÜß0-9_ -]*$/)]],
    description: [''],
    date: ['', Validators.required],
    prio: [''],
    assigned: [''],
    subtasks: [''],
  });


  constructor()
  {
    this.loadData();
  }

  async loadData()
  {
    // const data = await this.dbService.loadTasks(2);
    // console.log(data)
  }

  async onSubmit()
  {

  }

  onSubtaskChange(subtask: SUBTASK, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    subtask.done = checkbox.checked;
  }

  goBackToDetailsView()
  {
    this.isEdit = false;
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
  // resetForm()
  // {
  //   this.taskDetailForm.reset()
  //   this.subtasks = [];
  // }
  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskDetailForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }

  deleteTask()
  {
    
  }

  editTask()
  {
    this.isEdit = true;
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

}
