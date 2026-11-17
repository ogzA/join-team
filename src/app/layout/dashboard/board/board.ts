import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  DropListOrientation,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { NameLogo } from '../../../shared/services/name-logo';
import { Supabase } from '../../../shared/services/supabase';
import { SelectedTask, Task, TaskStatus } from '../../../shared/models/task';
import { ShowTaskDetails } from '../Task/show-task-details/show-task-details';

/**
 * Media query of the tablet layout, in which the cards of a column are shown side by side.
 *
 * @see $breakpoint-tablet in _variables.scss uses the same max-width; keep both in sync.
 */
const TABLET_QUERY = '(max-width: 1100px)';
import { AddTask } from '../Task/add-task/add-task';

/** A row of the Supabase `tasks` table; only used by {@link DUMMY_ROWS}. */
interface BoardRow {
  /** Row id (1 = to do, 2 = in progress, 3 = await feedback, 4 = done). */
  id: number;
  /** Status of the column. */
  status: string;
  /** Tasks of the column wrapped in an outer array, or an empty string if there are none. */
  taskjson: Task[][] | '';
}

/** A column of the board with its status, display name and the tasks shown in it. */
interface BoardColumn {
  /** Status of the tasks in this column. */
  status: TaskStatus;
  /** Display name of the column. */
  label: string;
  /** Supabase row of the column (1 = to do, 2 = in progress, 3 = await feedback, 4 = done). */
  rowId: number;
  /** Visible tasks; drag & drop moves them directly inside this array before saving. */
  tasks: Task[];
  /** Position of each visible task in the unfiltered column, so search results open correctly. */
  positions: number[];
}

/**
 * Sample rows with test tasks (urgent priority, long title and description, many assignees,
 * an empty column). Not used by the board, which loads its tasks from Supabase.
 */
const DUMMY_ROWS: BoardRow[] = [
  {
    id: 1,
    status: 'to do',
    taskjson: [
      [
        {
          date: '10/05/2023',
          prio: 'Medium',
          title: 'Kochwelt Page & Recipe Recommender',
          assigned: ['Linda Blütenzauber', 'Hans Zimmer', 'Susi Sorglos'],
          category: 'User Story',
          subtasks: [
            { done: true, task: 'Implement Recipe Recommedation' },
            { done: false, task: 'Start Page Layout' },
          ],
          description: 'Build start page with recipe recommendation.',
        },
        {
          date: '31/12/2026',
          prio: 'Low',
          title: 'HTML Base Template Creation',
          assigned: ['Angela Merkel', 'Hans Zimmer', 'Lara Bach', 'Jürgen Schulz'],
          category: 'Technical Task',
          subtasks: [
            { done: false, task: 'Create HTML Base Template' },
            { done: false, task: 'Make it resuable' },
          ],
          description: 'Create reusable HTML Base templates...',
        },
      ],
    ],
  },
  {
    id: 2,
    status: 'in progress',
    taskjson: [
      [
        {
          date: '15/11/2026',
          prio: 'Urgent',
          title: 'Daily Kochwelt Recipe',
          assigned: ['Jürgen Schulz'],
          category: 'User Story',
          subtasks: [
            { done: true, task: 'Define recipe data structure' },
            { done: true, task: 'Build recipe card' },
            { done: false, task: 'Connect to API' },
          ],
          description: 'Implement daily recipe and portion calculator.',
        },
        {
          date: '20/11/2026',
          prio: 'Medium',
          title: 'Very long task title to test text overflow inside the card container',
          assigned: [
            'Angela Merkel',
            'Jürgen Schulz',
            'Susi Sorglos',
            'Hans Zimmer',
            'Lara Bach',
            'Linda Blütenzauber',
          ],
          category: 'Technical Task',
          subtasks: [],
          description:
            'This description is intentionally long to check whether the text is clamped after two lines and does not break the layout of the card.',
        },
      ],
    ],
  },
  {
    id: 3,
    status: 'await feedback',
    taskjson: '',
  },
  {
    id: 4,
    status: 'done',
    taskjson: [
      [
        {
          date: '01/10/2026',
          prio: 'Low',
          title: 'CSS Architecture Planning',
          assigned: ['Susi Sorglos', 'Jürgen Schulz'],
          category: 'Technical Task',
          subtasks: [
            { done: true, task: 'Establish CSS methodology' },
            { done: true, task: 'Setup base styles' },
          ],
          description: 'Define CSS naming conventions and structure.',
        },
      ],
    ],
  },
];

/**
 * Kanban board with the four task columns: search, drag & drop between columns
 * (move menu on mobile), the task details dialog and the add task dialog.
 */
@Component({
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, ShowTaskDetails, AddTask],
  selector: 'app-board',
  styleUrl: './board.scss',
  templateUrl: './board.html',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class Board implements OnInit {
  protected nlService = inject(NameLogo);
  private breakpointObserver = inject(BreakpointObserver);
  private dbService = inject(Supabase);

  /**
   * True while the tablet layout is active (cards of a column side by side).
   * Starts with the current match, so the first render already uses the right orientation.
   */
  protected isTablet = toSignal(
    this.breakpointObserver.observe(TABLET_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(TABLET_QUERY) },
  );

  /** Drag direction of the CDK drop lists: horizontal on tablet and mobile, vertical on desktop. */
  protected dropOrientation = computed<DropListOrientation>(() =>
    this.isTablet() ? 'horizontal' : 'vertical',
  );

  /** Display names of the columns by status. */
  protected columnLabels: Record<string, string> = {
    'to do': 'To do',
    'in progress': 'In progress',
    'await feedback': 'Await feedback',
    done: 'Done',
  };

  /**
   * The four board columns, built from the column signals of the service.
   * Rebuilt automatically when new tasks are loaded or the search term changes;
   * the filtering happens in {@link buildColumn}.
   */
  protected columns = computed<BoardColumn[]>(() => [
    this.buildColumn('to do', 1, this.dbService.toDoTasks()),
    this.buildColumn('in progress', 2, this.dbService.inProgressTasks()),
    this.buildColumn('await feedback', 3, this.dbService.awaitFeedbackTasks()),
    this.buildColumn('done', 4, this.dbService.doneTasks()),
  ]);

  /** Maximum number of avatars shown on a card; the rest is shown as "+N". */
  protected maxAvatars = 3;
  /** Clicked task with its column and position; `null` while the details dialog is closed. */
  protected selectedTask = signal<SelectedTask | null>(null);
  /** Column and card index of the open move menu (mobile); `null` while it is closed. */
  protected moveMenu = signal<{ rowId: number; index: number } | null>(null);

  /** Loads the tasks of all columns from Supabase and focuses the search input. */
  ngOnInit(): void {
    this.dbService.getTasks();

    const elemRef = document.getElementById(`seachInput`);
    elemRef?.focus();
  }

  /**
   * Builds one column and remembers the original position of each task before filtering,
   * so the details dialog still edits the right task while searching.
   *
   * @param status - Status of the column.
   * @param rowId - Supabase row of the column.
   * @param allTasks - All tasks of the column from the service.
   * @returns The column with the tasks that match the search.
   */
  private buildColumn(status: TaskStatus, rowId: number, allTasks: Task[]): BoardColumn {
    const visible = allTasks
      .map((task, position) => ({ task, position }))
      .filter(({ task }) => this.matchesSearch(task));
    return {
      status,
      label: this.columnLabels[status],
      rowId,
      tasks: visible.map(({ task }) => this.normalizeTask(task)),
      positions: visible.map(({ position }) => position),
    };
  }

  /**
   * Checks whether the title or the description contains the current search term.
   *
   * @param task - The task to check.
   * @returns True if the task matches; every task matches an empty search term.
   */
  private matchesSearch(task: Task): boolean {
    const term = this.lowerCaseSearchTerm();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description ?? '').toLowerCase().includes(term)
    );
  }

  /**
   * Fills missing `assigned` and `subtasks` (older data) with empty arrays.
   *
   * @param task - The task as loaded from Supabase.
   * @returns A copy of the task with both arrays set.
   */
  private normalizeTask(task: Task): Task {
    return { ...task, assigned: task.assigned ?? [], subtasks: task.subtasks ?? [] };
  }

  /**
   * Counts the completed subtasks of a task.
   *
   * @param task - The task to count.
   * @returns The number of done subtasks.
   */
  protected doneCount(task: Task): number {
    return task.subtasks.filter((subtask) => subtask.done).length;
  }
  /**
   * Calculates the subtask progress for the progress bar.
   * Only called for tasks with subtasks, otherwise it would divide by zero.
   *
   * @param task - The task to calculate.
   * @returns The share of done subtasks in percent (0 to 100).
   */
  protected progress(task: Task): number {
    return (this.doneCount(task) / task.subtasks.length) * 100;
  }

  /**
   * Opens the task details. If the move menu is open, the tap only closes the menu.
   *
   * @param task - The clicked task.
   * @param rowId - Supabase row of the task's column.
   * @param index - Position in the unfiltered column, see {@link BoardColumn.positions}.
   */
  protected openTask(task: Task, rowId: number, index: number): void {
    if (this.moveMenu()) {
      this.closeMoveMenu();
      return;
    }
    this.selectedTask.set({ task, rowId, index });
  }

  /** Closes the task details dialog. */
  protected closeTaskDetails(): void {
    this.selectedTask.set(null);
  }

  /**
   * Opens the mobile move menu and scrolls its card fully into view first.
   *
   * @param rowId - Supabase row of the card's column.
   * @param index - Index of the card in the column.
   * @param event - Click event of the move button, used to find the card.
   */
  protected openMoveMenu(rowId: number, index: number, event: Event): void {
    const card = (event.currentTarget as HTMLElement).closest('.task-card');
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    this.moveMenu.set({ rowId, index });
  }

  /** Closes the mobile move menu. */
  protected closeMoveMenu(): void {
    this.moveMenu.set(null);
  }

  /**
   * Checks whether the open move menu belongs to this card.
   *
   * @param rowId - Supabase row of the card's column.
   * @param index - Index of the card in the column.
   * @returns True if the move menu of this card is open.
   */
  protected isMoveMenuOpen(rowId: number, index: number): boolean {
    const menu = this.moveMenu();
    return menu?.rowId === rowId && menu.index === index;
  }

  /**
   * Moves a task to the end of another column, same as dropping it there.
   *
   * @param from - Column the task comes from.
   * @param index - Index of the task in the source column.
   * @param to - Target column.
   */
  protected moveTaskTo(from: BoardColumn, index: number, to: BoardColumn): void {
    transferArrayItem(from.tasks, to.tasks, index, to.tasks.length);
    this.closeMoveMenu();
    this.dbService.moveTask(from.tasks, from.rowId, to.tasks, to.rowId);
  }

  /**
   * Moves a task after it was dropped. Inside the same column only the new order is saved,
   * otherwise both columns are saved.
   *
   * @param event - Drop event with the source and target column as container data.
   */
  protected dropTask(event: CdkDragDrop<BoardColumn>): void {
    const from = event.previousContainer.data;
    const to = event.container.data;
    if (from === to) {
      moveItemInArray(to.tasks, event.previousIndex, event.currentIndex);
      this.dbService.setTasks(to.tasks, to.rowId);
    } else {
      transferArrayItem(from.tasks, to.tasks, event.previousIndex, event.currentIndex);
      this.dbService.moveTask(from.tasks, from.rowId, to.tasks, to.rowId);
    }
  }

  /** Current text of the search input; cleared after each search. */
  searchTerm = signal('');
  /** Lowercase term of the last search; the columns are filtered by it. */
  lowerCaseSearchTerm = signal('');
  /**
   * True while a search filter is active. Drag & drop and the move menu are disabled then,
   * because the columns only contain the matching tasks.
   */
  protected isSearching = computed(() => this.lowerCaseSearchTerm().length > 0);
  /** Placeholder of the search input; shows "Nothing found..." after a search without results. */
  searchPlaceHolder = signal('Find Task');

  /**
   * Applies the entered search term and clears the input; an empty search shows all tasks again.
   * If no task matches, the placeholder shows "Nothing found..." in red, otherwise it is reset.
   */
  searchFilter() {
    this.lowerCaseSearchTerm.set(this.searchTerm().toLowerCase());
    this.searchTerm.set('');
    const elemRef = document.getElementById(`seachInput`);

    if (this.columns().every((column) => column.tasks.length === 0)) {
      this.searchPlaceHolder.set('Nothing found...');
      elemRef?.classList.add('red-placeholder');
    } else {
      this.searchPlaceHolder.set('Find Task');
      elemRef?.classList.remove('red-placeholder');
    }
  }

  /** True while the add task dialog is open. */
  isAddTaskOpen = signal(false);

  /**
   * Opens the add task dialog.
   *
   * @param status - Column the new task is added to.
   */
  protected openAddTask(status: TaskStatus = 'to do') {
    this.addTaskStatus.set(status);
    this.isAddTaskOpen.set(true);
  }

  /** Closes the add task dialog. */
  closeAddTask() {
    this.isAddTaskOpen.set(false);
  }

  /** Closes the open move menu and the add task dialog on Escape. */
  protected onEscape(): void {
    this.closeMoveMenu();
    this.closeAddTask();
  }

  /** Column in which the add task dialog creates the new task. */
  protected addTaskStatus = signal<TaskStatus>('to do');
}
