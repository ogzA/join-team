import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../../shared/services/supabase';
import { DatePipe } from '@angular/common';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-summary',
  styleUrl: './summary.scss',
  templateUrl: './summary.html',
})
export class Summary {
  dbService = inject(Supabase);
  deadline = signal('');
  deadlineArray: string[] = [];
  nextText = signal('Upcoming');

  ngOnInit() {
    setTimeout(() => {
      this.checkNextDeadline();
    }, 250);
  }

  checkNextDeadline() {
    this.addToDoinArray();
    this.addInProgressinArray();
    this.addAwaitFeedbackinArray();
    this.deadlineArray.sort();
    this.deadline.set(this.deadlineArray[0]);
    // console.log('Deadline:', this.deadline());
    let today = new Date().toJSON().slice(0, 10);

    if (this.deadline() < today) this.nextText.set('Passed');
    else this.nextText.set('Upcoming');
  }

  addToDoinArray() {
    let start = this.deadlineArray.length;
    if (this.dbService.toDoTasks().length > 0) {
      for (let index = 0; index < this.dbService.toDoTasks().length; index++) {
        this.deadlineArray[start] = this.dbService.toDoTasks()[index].date;
        if (index < this.dbService.toDoTasks().length) start++;
      }
    }
  }

  addInProgressinArray() {
    let start = this.deadlineArray.length;
    if (this.dbService.inProgressTasks().length > 0) {
      for (let index = 0; index < this.dbService.inProgressTasks().length; index++) {
        this.deadlineArray[start] = this.dbService.inProgressTasks()[index].date;
        if (index < this.dbService.inProgressTasks().length) start++;
      }
    }
  }

  addAwaitFeedbackinArray() {
    let start = this.deadlineArray.length;
    if (this.dbService.awaitFeedbackTasks().length > 0) {
      for (let index = 0; index < this.dbService.awaitFeedbackTasks().length; index++) {
        this.deadlineArray[start] = this.dbService.awaitFeedbackTasks()[index].date;
        if (index < this.dbService.awaitFeedbackTasks().length) start++;
      }
    }
  }
}
