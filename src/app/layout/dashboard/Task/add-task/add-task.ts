import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../../../shared/services/supabase';
import { ToastService } from '../../../../shared/services/toast.service';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { TaskCategory, TaskPrio } from '../../../../shared/models/task';

interface SUBTASK {
  task: string;
  done: boolean;
}

@Component({
  imports: [ReactiveFormsModule, AssignedToDropdown],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {
  todaysDate: string = this.getTodayDate();
  placeholder: string = 'dd/mm/yyyy';
  subtaskInfo: boolean = false;
  subtasks: SUBTASK[] = [];
  isSaving = signal(false);
  editingIndex: number | null = null;
  editedTask: string = '';
  assigned = signal<string[]>([]);

  private fb = inject(FormBuilder);
  private dbService = inject(Supabase);
  private toast = inject(ToastService);

  taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/^[A-Za-z][a-zA-Z0-9_ -]*$/)]],
    description: [''],
    date: ['', Validators.required],
    prio: ['Medium'],
    assigned: [''],
    category: ['', Validators.required],
    subtasks: [''],
  });

  async onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      const formValue = this.taskForm.getRawValue();
      const taskData = {
        title: formValue.title,
        description: formValue.description,
        date: formValue.date,
        prio: formValue.prio as TaskPrio,
        assigned: this.assigned(),
        category: formValue.category as TaskCategory,
        subtasks: [...this.subtasks],
      };
      await this.dbService.addTaskToDo(taskData);
      this.toast.success('Task added to board');
      this.resetForm();
    } catch {
      this.toast.error('Task not added to board');
    } finally {
      this.isSaving.set(false);
    }
  }

  deleteSubTask(index: number) {
    this.subtasks.splice(index, 1);
  }

  subtaskEdit(index: number) {
    this.editingIndex = index;
    this.editedTask = this.subtasks[index].task;
  }

  getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  deleteEditTask() {
    this.editingIndex = null;
    this.editedTask = '';
  }

  confirmEditedTask(index: number) {
    const value = this.editedTask.trim();
    if (!value) {
      return;
    }
    this.subtasks[index] = {
      ...this.subtasks[index],
      task: value,
    };
    this.editingIndex = null;
    this.editedTask = '';
  }

  closeSubtask() {
    this.taskForm.get('subtasks')?.reset('');
    this.subtaskInfo = false;
  }

  addSubtask() {
    const control = this.taskForm.get('subtasks');
    const value = control?.value?.trim();
    if (!value) {
      return;
    }
    this.subtasks.push({ task: value, done: false });
    control?.reset('');
    this.subtaskInfo = false;
  }
  resetForm() {
    this.taskForm.reset();
    this.subtasks = [];
    this.assigned.set([]);
  }
  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }
}
