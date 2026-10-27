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

// The clicked task plus everything the details dialog needs to edit or delete it
export interface SelectedTask {
  task: Task;
  // Supabase row = column (1 = to do, 2 = in progress, 3 = await feedback, 4 = done)
  rowId: number;
  // Position of the task inside its column
  index: number;
}
