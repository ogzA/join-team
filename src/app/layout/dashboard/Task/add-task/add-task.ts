import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../../../shared/services/supabase';
import { ToastService } from '../../../../shared/services/toast.service';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { Subtask, Task, TaskCategory, TaskPrio, TaskStatus } from '../../../../shared/models/task';
import { getTodayDate, noPastDate } from '../task-validators';

/**
 * Form for creating a new task. Used as a dashboard page and inside the add task dialog of the
 * board (see {@link inDialog}).
 */
@Component({
  imports: [ReactiveFormsModule, AssignedToDropdown],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {
  /** Today's date as `YYYY-MM-DD`, used as the minimum of the date input. */
  todaysDate: string = getTodayDate();
  /** Display format of the due date (`dd/mm/yyyy`); not used in the template. */
  placeholder: string = 'dd/mm/yyyy';
  /** True while the subtask input contains text, which shows its cancel and add buttons. */
  subtaskInfo: boolean = false;
  /** Subtasks added so far; saved together with the task. */
  subtasks: Subtask[] = [];
  /** True while the task is being saved; disables the create button. */
  isSaving = signal(false);
  /** Index of the subtask being edited, `null` if no subtask is edited. */
  editingIndex: number | null = null;
  /** Current text of the subtask being edited. */
  editedTask: string = '';
  /** Names of the assigned contacts, bound to the assigned-to dropdown. */
  assigned = signal<string[]>([]);

  private fb = inject(FormBuilder);
  private dbService = inject(Supabase);
  private toast = inject(ToastService);

  /** Task form; title, due date (today or later) and category are required. */
  taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/)]],
    description: [''],
    date: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/), noPastDate()]],
    prio: ['Medium'],
    assigned: [''],
    category: ['', Validators.required],
    subtasks: [''],
  });

  /**
   * Saves the new task in the column given by {@link status}. An invalid form only shows its
   * error messages. On success the form is reset and {@link closed} is emitted;
   * success and errors are shown as a toast.
   */
  async onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      const formValue = this.taskForm.getRawValue();
      const taskData: Task = {
        title: formValue.title,
        description: formValue.description,
        date: formValue.date,
        prio: formValue.prio as TaskPrio,
        assigned: this.assigned(),
        category: formValue.category as TaskCategory,
        subtasks: [...this.subtasks],
      };
      await this.dbService.addTask(taskData, this.status());
      this.toast.success('Task added to board');
      this.resetForm();
      this.closed.emit();
    } catch {
      this.toast.error('Task not added to board');
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Removes a subtask from the list.
   *
   * @param index - Index of the subtask.
   */
  deleteSubTask(index: number) {
    this.subtasks.splice(index, 1);
  }

  /**
   * Starts editing a subtask.
   *
   * @param index - Index of the subtask.
   */
  subtaskEdit(index: number) {
    this.editingIndex = index;
    this.editedTask = this.subtasks[index].task;
  }

  /** Cancels editing a subtask and keeps its original text. */
  deleteEditTask() {
    this.editingIndex = null;
    this.editedTask = '';
  }

  /**
   * Saves the edited subtask text. Empty text is ignored and editing stays active.
   *
   * @param index - Index of the edited subtask.
   */
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

  /** Clears the subtask input and hides its buttons. */
  closeSubtask() {
    this.taskForm.get('subtasks')?.reset('');
    this.subtaskInfo = false;
  }

  /** Adds the text of the subtask input as a new open subtask; empty input is ignored. */
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
  /** Resets the form to its initial values and clears the subtasks and assigned contacts. */
  resetForm() {
    this.taskForm.reset();
    this.subtasks = [];
    this.assigned.set([]);
  }
  /** Shows the buttons of the subtask input only while it contains text. */
  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }

  /** True inside the board dialog; changes the layout and the dropdown height. */
  inDialog = input(false);
  /** Column the new task is added to. */
  status = input<TaskStatus>('to do');
  /** Emits after the task was saved, so the dialog can close. */
  closed = output<void>();
}
