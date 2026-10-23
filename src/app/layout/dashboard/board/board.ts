import { Component, computed, inject, Signal, signal } from '@angular/core';
import { NameLogo } from '../../../shared/services/name-logo';
import { Supabase } from '../../../shared/services/supabase';
import { JsonPipe } from '@angular/common';

// ====== DUMMY START ======

interface Subtask {
  done: boolean;
  task: string;
}

interface Task {
  date: string;
  prio: string;
  title: string;
  assigned: string[];
  category: string;
  subtasks: Subtask[];
  description: string;
}

interface BoardRow {
  id: number;
  status: string;
  taskjson: Task[][] | '';
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
  imports: [JsonPipe],
  selector: 'app-board',
  styleUrl: './board.scss',
  templateUrl: './board.html',
})
export class Board {
  protected nlService = inject(NameLogo);
  // Datenquelle für das Board - Andres Daten später aus dem Service
  protected rows: BoardRow[] = DUMMY_ROWS;
  // Spaltennamen Anzeige
  protected columnLabels: Record<string, string> = {
    'to do': 'To do',
    'in progress': 'In progress',
    'await feedback': 'Await feedback',
    done: 'Done',
  };

  // Maximale Anzahl sichtbarer Avatare auf der Karte, Rest wird als "+Number" angezeigt
  protected maxAvatars = 3;
  // Aktuell angeklickter Task. null = keine Detailansicht offen
  // Die Detailansicht liest später dieses Signal
  protected selectedTask = signal<Task | null>(null);

  // Tasks werden aus Zeile geholt [[...]], "" wird zu []
  protected tasksOf(row: BoardRow): Task[] {
    return Array.isArray(row.taskjson) ? row.taskjson.flat() : [];
  }
  // Subtasks erledigt zählen
  protected doneCount(task: Task): number {
    return task.subtasks.filter((subtask) => subtask.done).length;
  }
  // Fortschrittsanzeige in Prozent
  protected progress(task: Task): number {
    return (this.doneCount(task) / task.subtasks.length) * 100;
  }

  // Merkt sich den angeklickten Task für die Detailansicht
  protected openTask(task: Task): void {
    this.selectedTask.set(task);
    console.log('Task geöffnet:', task.title); // Nur für Test, muss später gelöscht werden
  }

  // Such Test
  dbService = inject(Supabase);
  searchTerm = signal('');
  lowerCaseSearchTerm = signal('');

  searchFilter() {
    this.lowerCaseSearchTerm.set(this.searchTerm().toLowerCase());
    this.searchTerm.set('');
  }

  filteredToDo = computed(() => {
    return this.dbService
      .toDoTasks()
      .filter(
        (item) =>
          item.title.toLowerCase().includes(this.lowerCaseSearchTerm()) ||
          item.description.toLowerCase().includes(this.lowerCaseSearchTerm()),
      );
  });

  filteredinProgress = computed(() => {
    return this.dbService
      .inProgressTasks()
      .filter(
        (item) =>
          item.title.toLowerCase().includes(this.lowerCaseSearchTerm()) ||
          item.description.toLowerCase().includes(this.lowerCaseSearchTerm()),
      );
  });

  filteredAwaitFeedback = computed(() => {
    return this.dbService
      .awaitFeedbackTasks()
      .filter(
        (item) =>
          item.title.toLowerCase().includes(this.lowerCaseSearchTerm()) ||
          item.description.toLowerCase().includes(this.lowerCaseSearchTerm()),
      );
  });

  filteredDoneTasks = computed(() => {
    return this.dbService
      .doneTasks()
      .filter(
        (item) =>
          item.title.toLowerCase().includes(this.lowerCaseSearchTerm()) ||
          item.description.toLowerCase().includes(this.lowerCaseSearchTerm()),
      );
  });

  // Such Test Ende
}
