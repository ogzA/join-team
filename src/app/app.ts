import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './shared/services/supabase';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [RouterOutlet,JsonPipe],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join-team');

  dbService = inject(Supabase);

  ngOnInit() {
    this.dbService.getContacts();
  }
}
