import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {
  todays_date: string = this.getTodayDate();
  placeholder: string = 'dd/mm/yyyy';
  subtask_info: boolean = false;
  subtasks: string[] = [];
  isSaving = signal(false);
  editingIndex: number | null = null;
  editedTask: string = '';  
  private fb = inject(FormBuilder);

  taskForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: ['', Validators.required],
    priority: ['medium'],
    assignedTo: [''],
    category: ['', Validators.required],
    subtask: [''],
  });
 

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      const taskData = {
        ...this.taskForm.getRawValue(),
        subtasks: [...this.subtasks],
      };
      console.log(taskData);
    } catch {
      //this.toast.error('Task not added');
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteSubTask(index:number) {
    this.subtasks.splice(index,1);
    console.log(this.subtasks)
  }

  subtaskEdit(index:number) {
    this.editingIndex = index;
    this.editedTask = this.subtasks[index];
  }

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  deleteEditTask()
  {
    this.editingIndex = null;
    this.editedTask = '';
  }

  confirmEditedTask(index:number){
    const value = this.editedTask.trim();
    if (!value) {
      return;
    }
    this.subtasks[index] = value;
    this.editingIndex = null;
    this.editedTask = '';
  }

  collectEditValue(data:string)
  {
    console.log(data)
  }

  closeSubtask() {
    this.taskForm.get('subtask')?.reset('');
    this.subtask_info = false;
  }

  addSubtask() {
    const control = this.taskForm.get('subtask');
    const value = control?.value?.trim();
    if (!value) {
      return;
    }
    this.subtasks.push(value);
    control?.reset('');
    this.subtask_info = false;
    console.log(this.subtasks);
  }

  showAddSubTask() {
    this.subtask_info = true;
    const value = this.taskForm.get('subtask')?.value ?? '';
    this.subtask_info = value.trim().length > 0;
  }
}
