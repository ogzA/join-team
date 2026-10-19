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
      //await this.dbService.addTask({ ...this.taskform.getRawValue()});
      ///this.toast.success('Contact successfully created');
      console.log(this.taskForm.getRawValue());
    } catch {
      //this.toast.error('Task not added');
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteSubTask() {
    //this.subtasks.splice();
  }

  subtaskEdit() {

  }

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
