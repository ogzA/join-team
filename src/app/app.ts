import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './shared/services/supabase';
import { ToastClass } from './shared/toast/toast';

/** Root component: shows the routed page and the global toast and loads the app data on start. */
@Component({
  imports: [RouterOutlet, ToastClass],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  /** Name of the app. */
  protected readonly title = signal('join-team');

  dbService = inject(Supabase);

  /** Loads contacts, users and tasks from Supabase and starts the realtime sync. */
  ngOnInit() {
    this.dbService.loadData();
    this.dbService.getTasks();
  }
}
