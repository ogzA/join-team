import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { SelectedTask, Subtask, Task, TaskPrio } from '../../../../shared/models/task';
import { ToastService } from '../../../../shared/services/toast.service';
import { TitleCasePipe } from '@angular/common';
import { NameLogo } from '../../../../shared/services/name-logo';

@Component({
  imports: [ReactiveFormsModule, AssignedToDropdown, TitleCasePipe],
  selector: 'app-show-task-details',
  styleUrl: './show-task-details.scss',
  templateUrl: './show-task-details.html',
})
export class ShowTaskDetails {
  isEdit = signal(false);
  subtaskInfo: boolean = false;
  editingIndex: number | null = null;
  editedTask: string = '';
  isClosing = signal(false);

  priorityLogos = {
    low: 'assets/icons/prio-low.svg',
    medium: 'assets/icons/prio-medium.svg',
    urgent: 'assets/icons/prio-urgent.svg',
  };

  subtasks: Subtask[] = [];
  assigned = signal<string[]>([]);

  selected = input.required<SelectedTask>();

  protected task = computed<Task>(() => {
    const { rowId, index, task } = this.selected();
    const current = this.tasksOfRow(rowId)[index] ?? task;
    return { ...current, assigned: current.assigned ?? [], subtasks: current.subtasks ?? [] };
  });

  close = output<void>();

  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);
  protected nlService = inject(NameLogo);
  private toast = inject(ToastService);

  taskDetailForm = this.fb.nonNullable.group({
    title: [
      '',
      [Validators.required, Validators.pattern(/^[A-ZÄÖÜßa-zäöüẞ][a-zäöüẞA-ZÄÖÜß0-9_ -]*$/)],
    ],
    description: [''],
    date: ['', Validators.required],
    prio: [''],
    subtasks: [''],
  });

  async onSubmit() {
    if (this.taskDetailForm.invalid) {
      this.taskDetailForm.markAllAsTouched();
      return;
    }
    const { title, description, date, prio } = this.taskDetailForm.getRawValue();
    const updated: Task = {
      ...this.task(),
      title,
      description,
      date,
      prio: prio as TaskPrio,
      subtasks: this.subtasks,
      assigned: this.assigned(),
    };
    await this.saveTask(updated);
    this.toast.success('Task updated');
    this.isEdit.set(false);
  }

  /** Removes the task from its column and closes the dialog. */
  async deleteTask(): Promise<void> {
    const { rowId, index } = this.selected();
    const tasks = this.tasksOfRow(rowId).filter((_, i) => i !== index);
    await this.dbService.setTasks(tasks, rowId);
    this.toast.success('Task deleted');
    this.closeDialog();
  }

  /** Replace the task at its position and saves the whole column. */
  private async saveTask(updated: Task): Promise<void> {
    const { rowId, index } = this.selected();
    const tasks = [...this.tasksOfRow(rowId)];
    tasks[index] = updated;
    await this.dbService.setTasks(tasks, rowId);
  }

  /** Return the service tasks of a Supabase row (1 = to do ... 4 = done). */
  private tasksOfRow(rowId: number): Task[] {
    const rows = [
      this.dbService.toDoTasks,
      this.dbService.inProgressTasks,
      this.dbService.awaitFeedbackTasks,
      this.dbService.doneTasks,
    ];
    return rows[rowId - 1]();
  }

  toInputDate(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date; // already correct
    const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // dd/mm/yyyy
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  editTask() {
    const task = this.task();

    // reset(values) fills the form and clears any old touched/dirty fileds
    this.taskDetailForm.reset({
      title: task.title,
      description: task.description,
      date: this.toInputDate(task.date),
      prio: task.prio.charAt(0).toUpperCase() + task.prio.slice(1).toLowerCase(),
    });
    // copy the lists so editing doesn't change the displayed task before saving
    this.subtasks = task.subtasks.map((s) => ({ ...s }));
    this.assigned.set([...task.assigned]);
    this.isEdit.set(true);
  }

  async toggleSubtask(event: Event, index: number): Promise<void> {
    const done = (event.target as HTMLInputElement).checked;
    const task = this.task();
    const subtasks = task.subtasks.map((subtask, i) =>
      i === index ? { ...subtask, done } : subtask,
    );
    await this.saveTask({ ...task, subtasks });
  }

  closeDialog(): void {
    if (this.isClosing()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  deleteSubTask(index: number) {
    this.subtasks.splice(index, 1);
  }

  subtaskEdit(index: number) {
    this.editingIndex = index;
    this.editedTask = this.subtasks[index].task;
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
    this.taskDetailForm.get('subtasks')?.reset('');
    this.subtaskInfo = false;
  }

  addSubtask() {
    const control = this.taskDetailForm.get('subtasks');
    const value = control?.value?.trim();
    if (!value) {
      return;
    }
    this.subtasks.push({ task: value, done: false });
    control?.reset('');
    this.subtaskInfo = false;
  }

  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskDetailForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }
}
