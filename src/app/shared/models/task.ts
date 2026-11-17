/** A checklist item inside a task. */
export interface Subtask {
  /** Text of the subtask. */
  task: string;
  /** True once the subtask is completed. */
  done: boolean;
}

/** Categories a task can belong to. */
export type TaskCategory = 'User Story' | 'Technical Task';

/** Priorities a task can have. */
export type TaskPrio = 'Urgent' | 'Medium' | 'Low';

/** Board columns a task can be in. */
export type TaskStatus = 'to do' | 'in progress' | 'await feedback' | 'done';

/** A task as it is stored in the `taskjson` column of the Supabase `tasks` table. */
export interface Task {
  /** Title shown on the card. */
  title: string;
  /** Optional longer text, can be empty. */
  description: string;
  /** Due date in `YYYY-MM-DD` format (older entries may still use `DD/MM/YYYY`). */
  date: string;
  /** Priority of the task. */
  prio: TaskPrio;
  /** Category of the task. */
  category: TaskCategory;
  /** Names of the assigned contacts, empty array if nobody is assigned. */
  assigned: string[];
  /** Checklist items, empty array if there are none. */
  subtasks: Subtask[];
}

/** The clicked task plus everything the details dialog needs to edit or delete it. */
export interface SelectedTask {
  /** The clicked task. */
  task: Task;
  /**
   * Supabase row of the task's column
   * (1 = to do, 2 = in progress, 3 = await feedback, 4 = done).
   */
  rowId: number;
  /** Position of the task inside its column. */
  index: number;
}
