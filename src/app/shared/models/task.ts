// A sub-item of a task
export interface Subtask {
  task: string;
  done: boolean;
}

// Allowed categories
export type TaskCategory = 'User Story' | 'Technical Task';

// Allowed priorities
export type TaskPrio = 'Urgent' | 'Medium' | 'Low';

// A task, as it is stored in Supabase in `taskjson` format
export interface Task {
  title: string;
  description: string;
  // Due date in YYYY-MM-DD format
  date: string;
  prio: TaskPrio;
  category: TaskCategory;
  // Names of assigned contacts, empty = []
  assigned: string[];
  // Empty = []
  subtasks: Subtask[];
}
