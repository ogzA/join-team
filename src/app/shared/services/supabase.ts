import { computed, inject, Service, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Task, TaskStatus } from '../models/task';
import { Router } from '@angular/router';

/** Contact fields as they are written to the `contacts` table. */
interface Contact {
  /** Full name. */
  name: string;
  /** Email address. */
  email: string;
  /** Phone number. */
  phone: string;
  /** Role of the contact. */
  role: string;
}

/** User fields as they are written to the `user` table. */
interface User {
  /** Email address. */
  email: string;
  /** Password. */
  password: string;
  /** Role of the user. */
  role: string;
  /** Display name. */
  name: string;
}

/**
 * Central data service: holds contacts, users and the tasks of the four board columns as signals
 * and keeps them in sync with Supabase.
 * Each board column is stored as one row of the `tasks` table:
 * 1 = to do, 2 = in progress, 3 = await feedback, 4 = done.
 */
@Service()
export class Supabase {
  /** URL of the Supabase project. */
  supabseUrl = 'https://lvreicyjypltqvutgvly.supabase.co';
  /** Publishable (public) API key of the Supabase project. */
  supabaseKey = 'sb_publishable_iELLkIsUUv19dITy-f83Rw_nH8U3yof';
  /** Supabase client, also used by {@link SupabaseAuth}. */
  supabase = createClient(this.supabseUrl, this.supabaseKey);

  /** All contacts, sorted by name. */
  contacts = signal<
    { id: number; created_at: string; name: string; email: string; phone: string; role: string }[]
  >([]);

  /** All rows of the `user` table. */
  user = signal<
    {
      id: number;
      created_at: string;
      email: string;
      password: string;
      role: string;
      name: string;
    }[]
  >([]);

  /** Tasks of the "To do" column (row 1). */
  toDoTasks = signal<Task[]>([]);
  /** Tasks of the "In progress" column (row 2). */
  inProgressTasks = signal<Task[]>([]);
  /** Tasks of the "Await feedback" column (row 3). */
  awaitFeedbackTasks = signal<Task[]>([]);
  /** Tasks of the "Done" column (row 4). */
  doneTasks = signal<Task[]>([]);
  private router = inject(Router);

  /** Realtime channel that reloads the data when the database changes. */
  channels: RealtimeChannel | undefined;

  /**
   * Loads contacts and users and subscribes to realtime changes:
   * task updates reload the tasks, contact or user changes reload that list.
   */
  loadData() {
    this.getContacts();
    this.getUser();

    this.channels = this.supabase
      .channel('changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, () =>
        this.getTasks(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () =>
        this.getContacts(),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user' }, () => this.getUser())
      .subscribe();
  }

  /**
   * Loads the tasks of all four columns into the column signals.
   *
   * @throws The Supabase error if the request fails.
   */
  async getTasks() {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('id, taskjson')
      .in('id', [1, 2, 3, 4]);
    if (error) throw error;
    const rows = data ?? [];
    this.toDoTasks.set(this.taskOfRow(rows, 1));
    this.inProgressTasks.set(this.taskOfRow(rows, 2));
    this.awaitFeedbackTasks.set(this.taskOfRow(rows, 3));
    this.doneTasks.set(this.taskOfRow(rows, 4));
  }

  /**
   * Returns the tasks stored in one row of the `tasks` table.
   *
   * @param rows - Rows loaded from the `tasks` table.
   * @param rowId - The row to read (1 = to do … 4 = done).
   * @returns The tasks of the row, or an empty array if the row is missing or has no task list.
   */
  private taskOfRow(rows: { id: number; taskjson: Task[][] | '' }[], rowId: number): Task[] {
    const row = rows.find((r) => r.id === rowId);
    if (!row || !Array.isArray(row.taskjson)) return [];
    return row.taskjson[0] ?? [];
  }

  /**
   * Saves the complete task list of one column and reloads all tasks.
   *
   * @param data - All tasks of the column in display order.
   * @param rowID - Supabase row of the column (1 = to do, 2 = in progress, 3 = await feedback,
   * 4 = done).
   * @throws The Supabase error if the update fails.
   */
  async setTasks(data: Task[], rowID: number) {
    const { error } = await this.supabase
      .from('tasks')
      .update({ taskjson: [data] })
      .eq('id', rowID);
    if (error) throw error;
    await this.getTasks();
  }

  /**
   * Saves both affected columns at the same time after a task was moved to another column and
   * reloads the tasks only once, so no card briefly disappears.
   *
   * @param fromTask - Tasks of the source column after the move.
   * @param fromRowId - Supabase row of the source column.
   * @param toTasks - Tasks of the target column after the move.
   * @param toRowId - Supabase row of the target column.
   * @throws The first Supabase error if one of the updates fails (after reloading the tasks).
   */
  async moveTask(fromTask: Task[], fromRowId: number, toTasks: Task[], toRowId: number) {
    const results = await Promise.all([
      this.supabase
        .from('tasks')
        .update({ taskjson: [fromTask] })
        .eq('id', fromRowId),
      this.supabase
        .from('tasks')
        .update({ taskjson: [toTasks] })
        .eq('id', toRowId),
    ]);
    await this.getTasks();
    const failed = results.find((result) => result.error);
    if (failed) throw failed.error;
  }

  /**
   * Appends a task to the "To do" column and saves the column.
   *
   * @param object - The new task.
   */
  addTaskToDo(object: Task) {
    this.toDoTasks().push(object);
    this.setTasks(this.toDoTasks(), 1);
  }

  /**
   * Adds a new task at the top of the given column and saves the column.
   * Tasks cannot be added to "done" directly, so nothing happens for that status.
   *
   * @param object - The new task.
   * @param status - The column the task is added to.
   */
  async addTask(object: Task, status: TaskStatus) {
    switch (status) {
      case 'to do':
        return this.setTasks([object, ...this.toDoTasks()], 1);
      case 'in progress':
        return this.setTasks([object, ...this.inProgressTasks()], 2);
      case 'await feedback':
        return this.setTasks([object, ...this.awaitFeedbackTasks()], 3);
    }
  }

  /**
   * Appends a task to the "In progress" column and saves the column.
   *
   * @param object - The new task.
   */
  addTaskInProgress(object: Task) {
    this.inProgressTasks().push(object);
    this.setTasks(this.inProgressTasks(), 2);
  }

  /**
   * Appends a task to the "Await feedback" column and saves the column.
   *
   * @param object - The new task.
   */
  addTaskAwaitFeedback(object: Task) {
    this.awaitFeedbackTasks().push(object);
    this.setTasks(this.awaitFeedbackTasks(), 3);
  }

  /**
   * Appends a task to the "Done" column and saves the column.
   *
   * @param object - The new task.
   */
  addTaskDoneTasks(object: Task) {
    this.doneTasks().push(object);
    this.setTasks(this.doneTasks(), 4);
  }

  /**
   * Replaces the task at the given position and saves the column.
   * Does nothing if there is no task at that position.
   *
   * @param data - All tasks of the column.
   * @param rowID - Supabase row of the column.
   * @param object - The updated task.
   * @param index - Position of the task to replace.
   */
  editTask(data: Task[], rowID: number, object: Task, index: number) {
    let length = this.checkLength(data, index);

    if (data[index] && object && length > index) {
      data[index] = object;
      this.setTasks(data, rowID);
    } else {
    }
  }

  /**
   * Counts the tasks up to the first empty slot of the list.
   *
   * @param data - The task list.
   * @param index - Position that has to contain a task, otherwise 0 is returned.
   * @returns The number of tasks before the first empty slot, or 0 if `index` is empty.
   */
  checkLength(data: Task[], index: number) {
    let length = 0;
    if (data[index] !== undefined) {
      while (data[length] !== undefined) {
        length++;
      }
    }
    return length;
  }

  /**
   * Removes a task from the "To do" column and saves the column.
   * Does nothing if the position does not exist.
   *
   * @param index - Position of the task.
   */
  deleteTaskToDo(index: number) {
    if (this.toDoTasks().length > index) {
      this.toDoTasks().splice(index, 1);
      this.setTasks(this.toDoTasks(), 1);
    } else {
    }
  }

  /**
   * Removes a task from the "In progress" column and saves the column.
   * Does nothing if the position does not exist.
   *
   * @param index - Position of the task.
   */
  deleteTaskInProgress(index: number) {
    if (this.inProgressTasks().length > index) {
      this.inProgressTasks().splice(index, 1);
      this.setTasks(this.inProgressTasks(), 2);
    } else {
    }
  }

  /**
   * Removes a task from the "Await feedback" column and saves the column.
   * Does nothing if the position does not exist.
   *
   * @param index - Position of the task.
   */
  deleteTaskAwaitFeedback(index: number) {
    if (this.awaitFeedbackTasks().length > index) {
      this.awaitFeedbackTasks().splice(index, 1);
      this.setTasks(this.awaitFeedbackTasks(), 3);
    } else {
    }
  }

  /**
   * Removes a task from the "Done" column and saves the column.
   * Does nothing if the position does not exist.
   *
   * @param index - Position of the task.
   */
  deleteTaskDoneTasks(index: number) {
    if (this.doneTasks().length > index) {
      this.doneTasks().splice(index, 1);
      this.setTasks(this.doneTasks(), 4);
    } else {
    }
  }

  /** Removes the realtime channel when the service is destroyed. */
  ngOnDestroy() {
    if (this.channels) this.supabase.removeChannel(this.channels);
  }

  /** Loads all contacts, sorted by name. */
  async getContacts() {
    let response = await this.supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });
    if (!response) return;
    this.contacts.set(response.data ?? ([] as Contact[]));
  }

  /** Loads all rows of the `user` table. */
  async getUser() {
    let response = await this.supabase.from('user').select('*');
    if (!response) return;
    this.user.set(response.data ?? ([] as User[]));
  }

  /**
   * Creates a contact and reloads the contact list.
   *
   * @param contact - The new contact.
   * @returns The saved row as an object, including its new id.
   * @throws The Supabase error if the insert fails.
   */
  async setContact(contact: { name: string; email: string; phone: string; role: string }) {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert([contact])
      .select()
      .single();
    if (error) throw error;
    await this.getContacts();
    return data;
  }

  /**
   * Creates a row in the `user` table. Errors are ignored.
   *
   * @param user - The new user.
   */
  async setUser(user: { email: string; password: string; role: string; name: string }) {
    const { data, error } = await this.supabase.from('user').insert([user]).select();
  }

  /**
   * Updates a contact and reloads the contact list.
   *
   * @param id - Id of the contact.
   * @param contact - The new name, email and phone.
   * @throws The Supabase error if the update fails.
   */
  async updateContact(id: number, contact: { name: string; email: string; phone: string }) {
    const { error } = await this.supabase.from('contacts').update(contact).eq('id', id);
    if (error) throw error;
    await this.getContacts();
  }

  /**
   * Sets the name of a user to the fixed test value `'Neuer Wert'`. Errors are ignored.
   *
   * @param id - Id of the user.
   */
  async updateUser(id: number) {
    const { data: error } = await this.supabase
      .from('user')
      .update({ name: 'Neuer Wert' })
      .eq('id', id)
      .select();
  }

  /**
   * Deletes a contact and reloads the contact list.
   *
   * @param id - Id of the contact.
   * @throws The Supabase error if the delete fails.
   */
  async deleteContact(id: number) {
    const { error } = await this.supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
    await this.getContacts();
  }

  /**
   * Deletes a row of the `user` table. Errors are ignored.
   *
   * @param id - Id of the user.
   */
  async deleteUser(id: number) {
    const { data: error } = await this.supabase.from('user').delete().eq('id', id);
  }

  /** Id of the selected contact, `null` if no contact is selected. */
  selectedContactId = signal<number | null>(null);

  /** The selected contact, `undefined` if no contact is selected. */
  selectedContact = computed(() => {
    return this.contacts().find((contact) => contact.id === this.selectedContactId());
  });

  /**
   * Selects a contact, e.g. to show its details or to highlight a newly created contact.
   *
   * @param id - Id of the contact.
   */
  selectContact(id: number) {
    this.selectedContactId.set(id);
  }
}
