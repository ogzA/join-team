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

// Muss zu $breakpoint-tablet in _variables.scss passen (max-width wie im SCSS)
const TABLET_QUERY = '(max-width: 1100px)';
import { AddTask } from '../Task/add-task/add-task';

// ====== DUMMY START ======

interface BoardRow {
  id: number;
  status: string;
  taskjson: Task[][] | '';
}

// Eine Spalte im Board: Status, Anzeigename und ihre Tasks
// Das Array bleibt bestehen, damit Drag & Drop Tasks darin verschieben kann
interface BoardColumn {
  status: TaskStatus;
  label: string;
  // Supabase-Zeile dieser Spalte (1 = to do ... 4 = done)
  rowId: number;
  tasks: Task[];
  positions: number[];
}

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
        // Testfall: Prio "Urgent", ein Avatar, Fortschritt 2/3
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

// ====== DUMMY ENDE ======

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

  // true, solange das Tablet-Layout aktiv ist (Karten einer Spalte nebeneinander)
  // Startwert direkt abfragen, damit beim ersten Rendern schon die richtige Richtung gilt
  protected isTablet = toSignal(
    this.breakpointObserver.observe(TABLET_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpointObserver.isMatched(TABLET_QUERY) },
  );

  // Drag-Richtung fürs CDK: nebeneinander auf Tablet/mobile, untereinander auf Desktop
  protected dropOrientation = computed<DropListOrientation>(() =>
    this.isTablet() ? 'horizontal' : 'vertical',
  );

  // Spaltennamen Anzeige
  protected columnLabels: Record<string, string> = {
    'to do': 'To do',
    'in progress': 'In progress',
    'await feedback': 'Await feedback',
    done: 'Done',
  };

  // Spalten fürs Board aus den vier Service-Signals
  // Wird automatisch neu gebaut, sobald getTasks() neue Daten liefert
  // Volle Service-Listen, gefiltert wird in buildColumn()
  protected columns = computed<BoardColumn[]>(() => [
    this.buildColumn('to do', 1, this.dbService.toDoTasks()),
    this.buildColumn('in progress', 2, this.dbService.inProgressTasks()),
    this.buildColumn('await feedback', 3, this.dbService.awaitFeedbackTasks()),
    this.buildColumn('done', 4, this.dbService.doneTasks()),
  ]);

  // Maximale Anzahl sichtbarer Avatare auf der Karte, Rest wird als "+Number" angezeigt
  protected maxAvatars = 3;
  // Angeklickter Task samt Spalte und Position, null = kein Dialog offen
  protected selectedTask = signal<SelectedTask | null>(null);
  // Offenes Verschieben-Menü (mobile): Spalte und Index der Karte, null = zu
  protected moveMenu = signal<{ rowId: number; index: number } | null>(null);

  // Lädt beim Öffnen des Boards die Tasks aller Spalten aus Supabase
  ngOnInit(): void {
    this.dbService.getTasks();

    // Auto Fokus beim Seitenladen aufs Input Feld
    const elemRef = document.getElementById(`seachInput`);
    elemRef?.focus();
  }

  // Baut eine Spalte und merkt sich vor dem Filtern die Original-Position jedes Tasks
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

  // true, wenn Titel oder Beschreibung den Suchbegriff enthalten
  private matchesSearch(task: Task): boolean {
    const term = this.lowerCaseSearchTerm();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description ?? '').toLowerCase().includes(term)
    );
  }

  // Fehlende assigned/subtasks (ältere Daten) mit [] auffüllen
  private normalizeTask(task: Task): Task {
    return { ...task, assigned: task.assigned ?? [], subtasks: task.subtasks ?? [] };
  }

  // Subtasks erledigt zählen
  protected doneCount(task: Task): number {
    return task.subtasks.filter((subtask) => subtask.done).length;
  }
  // Fortschrittsanzeige in Prozent
  protected progress(task: Task): number {
    return (this.doneCount(task) / task.subtasks.length) * 100;
  }

  // Merkt sich den angeklickten Task samt Spalte und Position für den Detail-Dialog
  protected openTask(task: Task, rowId: number, index: number): void {
    this.selectedTask.set({ task, rowId, index });
  }

  protected closeTaskDetails(): void {
    this.selectedTask.set(null);
  }

  /** Opens the mobile move menu for the task at the given index. */
  protected openMoveMenu(rowId: number, index: number): void {
    this.moveMenu.set({ rowId, index });
  }

  /** Closes the mobile move menu. */
  protected closeMoveMenu(): void {
    this.moveMenu.set(null);
  }

  /** Returns true if the open move menu belongs to this task. */
  protected isMoveMenuOpen(rowId: number, index: number): boolean {
    const menu = this.moveMenu();
    return menu?.rowId === rowId && menu.index === index;
  }

  /** Moves a task to the end of another column, same as dropping it there. */
  protected moveTaskTo(from: BoardColumn, index: number, to: BoardColumn): void {
    transferArrayItem(from.tasks, to.tasks, index, to.tasks.length);
    this.closeMoveMenu();
    this.dbService.moveTask(from.tasks, from.rowId, to.tasks, to.rowId);
  }

  // Verschiebt einen Task nach dem Loslassen
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

  // Suche: Eingabe im Header, Filterung in buildColumn() über matchesSearch()
  searchTerm = signal('');
  lowerCaseSearchTerm = signal('');
  protected isSearching = computed(() => this.lowerCaseSearchTerm().length > 0);
  searchPlaceHolder = signal('Find Task');

  searchFilter() {
    this.lowerCaseSearchTerm.set(this.searchTerm().toLowerCase());
    this.searchTerm.set('');
    const elemRef = document.getElementById(`seachInput`);

    if (this.columns().every((column) => column.tasks.length === 0)) {
      this.searchPlaceHolder.set('Nothing found...'); // Platzhalter Text wenn nix gefunden
      elemRef?.classList.add('red-placeholder'); // Zusätzliche Klasse für die rote Farbe
    } else {
      this.searchPlaceHolder.set('Find Task'); // Platzhalter zurücksetzen
      elemRef?.classList.remove('red-placeholder'); // Klasse wieder entfernen
    }
  }

  // Add Task Dialog
  isAddTaskOpen = signal(false);

  protected openAddTask(status: TaskStatus = 'to do') {
    this.addTaskStatus.set(status);
    this.isAddTaskOpen.set(true);
  }

  closeAddTask() {
    this.isAddTaskOpen.set(false);
  }

  /** Closes the open move menu and the add task dialog on Escape. */
  protected onEscape(): void {
    this.closeMoveMenu();
    this.closeAddTask();
  }

  // Task Status
  protected addTaskStatus = signal<TaskStatus>('to do');
}
