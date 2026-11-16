import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { SelectedTask, Subtask, Task, TaskPrio } from '../../../../shared/models/task';
import { ToastService } from '../../../../shared/services/toast.service';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { NameLogo } from '../../../../shared/services/name-logo';
import { getTodayDate, noPastDate } from '../task-validators';

/**
 * Dialog that shows a task of the board. The subtasks can be checked off directly;
 * the task can be edited or deleted.
 */
@Component({
  imports: [ReactiveFormsModule, AssignedToDropdown, TitleCasePipe, DatePipe],
  selector: 'app-show-task-details',
  styleUrl: './show-task-details.scss',
  templateUrl: './show-task-details.html',
  host: {
    '(document:keydown.escape)': 'closeDialog()',
  },
})
export class ShowTaskDetails {
  /** Today's date as `YYYY-MM-DD`, used as the minimum of the date input. */
  todaysDate: string = getTodayDate();
  /** True while the edit form is shown instead of the task details. */
  isEdit = signal(false);
  /** True while the subtask input contains text, which shows its cancel and add buttons. */
  subtaskInfo: boolean = false;
  /** Index of the subtask being edited, `null` if no subtask is edited. */
  editingIndex: number | null = null;
  /** Current text of the subtask being edited. */
  editedTask: string = '';
  /** True while the closing animation runs. */
  isClosing = signal(false);

  /** Icon paths of the priorities. */
  priorityLogos = {
    low: 'assets/icons/prio-low.svg',
    medium: 'assets/icons/prio-medium.svg',
    urgent: 'assets/icons/prio-urgent.svg',
  };

  /** Working copy of the subtasks while editing. */
  subtasks: Subtask[] = [];
  /** Working copy of the assigned contact names while editing. */
  assigned = signal<string[]>([]);
  /** Editable fields as JSON from when editing started, see {@link hasChanges}. */
  private snapshot = '';
  /** Due date from when editing started; it stays valid even if it is in the past. */
  private originalDate = '';

  /** The clicked task with its column and position. */
  selected = input.required<SelectedTask>();

  /**
   * Current version of the selected task from the service, so saved changes show up right away.
   * Falls back to the passed task and fills missing arrays (older data) with `[]`.
   */
  protected task = computed<Task>(() => {
    const { rowId, index, task } = this.selected();
    const current = this.tasksOfRow(rowId)[index] ?? task;
    return { ...current, assigned: current.assigned ?? [], subtasks: current.subtasks ?? [] };
  });

  /** Emits after the closing animation, so the board can remove the dialog. */
  close = output<void>();

  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);
  protected nlService = inject(NameLogo);
  private toast = inject(ToastService);

  /** Edit form; the due date must be today or later unless it was not changed. */
  taskDetailForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/)]],
    description: [''],
    date: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{4}-\d{2}-\d{2}$/),
        noPastDate(() => this.originalDate),
      ],
    ],
    prio: [''],
    subtasks: [''],
  });

  /**
   * Saves the edited task and switches back to the details view.
   * An invalid form only shows its error messages.
   *
   * @throws The Supabase error if saving fails.
   */
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

  /**
   * Removes the task from its column and closes the dialog.
   *
   * @throws The Supabase error if saving the column fails.
   */
  async deleteTask(): Promise<void> {
    const { rowId, index } = this.selected();
    const tasks = this.tasksOfRow(rowId).filter((_, i) => i !== index);
    await this.dbService.setTasks(tasks, rowId);
    this.toast.success('Task deleted');
    this.closeDialog();
  }

  /**
   * Replaces the task at its position and saves the whole column.
   *
   * @param updated - The changed task.
   * @throws The Supabase error if saving fails.
   */
  private async saveTask(updated: Task): Promise<void> {
    const { rowId, index } = this.selected();
    const tasks = [...this.tasksOfRow(rowId)];
    tasks[index] = updated;
    await this.dbService.setTasks(tasks, rowId);
  }

  /**
   * Returns the service tasks of a Supabase row.
   *
   * @param rowId - Supabase row (1 = to do, 2 = in progress, 3 = await feedback, 4 = done).
   * @returns The tasks of that column.
   */
  private tasksOfRow(rowId: number): Task[] {
    const rows = [
      this.dbService.toDoTasks,
      this.dbService.inProgressTasks,
      this.dbService.awaitFeedbackTasks,
      this.dbService.doneTasks,
    ];
    return rows[rowId - 1]();
  }

  /**
   * Converts a due date to the `YYYY-MM-DD` format of the date input.
   * Older tasks may still store the date as `DD/MM/YYYY`.
   *
   * @param date - Due date as `YYYY-MM-DD` or `DD/MM/YYYY`.
   * @returns The date as `YYYY-MM-DD`, or an empty string for any other format.
   */
  toInputDate(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  /**
   * Switches to the edit form and fills it with the task; `reset(values)` also clears old
   * touched/dirty states. The priority is normalized (e.g. "medium" to "Medium") so the matching
   * radio button is checked. Subtasks and assigned contacts are copied, so editing does not
   * change the displayed task before saving.
   */
  editTask() {
    const task = this.task();
    this.originalDate = this.toInputDate(task.date);

    this.taskDetailForm.reset({
      title: task.title,
      description: task.description,
      date: this.toInputDate(task.date),
      prio: task.prio.charAt(0).toUpperCase() + task.prio.slice(1).toLowerCase(),
    });
    this.subtasks = task.subtasks.map((s) => ({ ...s }));
    this.assigned.set([...task.assigned]);
    this.snapshot = this.currentState();
    this.isEdit.set(true);
  }

  /**
   * Serializes the editable fields to compare them with the snapshot.
   *
   * @returns The editable fields as a JSON string.
   */
  private currentState(): string {
    const { title, description, date, prio } = this.taskDetailForm.getRawValue();
    return JSON.stringify({
      title,
      description,
      date,
      prio,
      assigned: this.assigned(),
      subtasks: this.subtasks,
    });
  }

  /**
   * Checks whether any field differs from the state when editing started.
   *
   * @returns True if there are unsaved changes; otherwise the OK button stays disabled.
   */
  hasChanges(): boolean {
    return this.currentState() !== this.snapshot;
  }

  /**
   * Checks or unchecks a subtask in the details view and saves the task right away.
   *
   * @param event - Change event of the checkbox.
   * @param index - Index of the subtask.
   * @throws The Supabase error if saving fails.
   */
  async toggleSubtask(event: Event, index: number): Promise<void> {
    const done = (event.target as HTMLInputElement).checked;
    const task = this.task();
    const subtasks = task.subtasks.map((subtask, i) =>
      i === index ? { ...subtask, done } : subtask,
    );
    await this.saveTask({ ...task, subtasks });
  }

  /**
   * Starts the closing animation and emits {@link close} when it ends (300 ms).
   * Further calls during the animation are ignored. Also called on Escape.
   */
  closeDialog(): void {
    if (this.isClosing()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.close.emit();
    }, 300);
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
    this.taskDetailForm.get('subtasks')?.reset('');
    this.subtaskInfo = false;
  }

  /** Adds the text of the subtask input as a new open subtask; empty input is ignored. */
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

  /** Shows the buttons of the subtask input only while it contains text. */
  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskDetailForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }
}
