import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../../shared/services/supabase';
import { DatePipe } from '@angular/common';
import { Task } from '../../../shared/models/task';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-summary',
  styleUrl: './summary.scss',
  templateUrl: './summary.html',
})
export class Summary {
  dbService = inject(Supabase);
  // deadline: string = '';
  nextDeadline = signal('');
  deadlineArray: string[] = [];
  nextText: string = 'Upcoming';
  nextCounts = signal<number[]>([]);

  ngOnInit() {
    if (
      this.dbService.toDoTasks().length < 1 &&
      this.dbService.inProgressTasks().length < 1 &&
      this.dbService.awaitFeedbackTasks().length < 1
    ) {
      setTimeout(() => {
        this.deadlineSet();
      }, 300);
    } else this.deadlineSet();
  }

  deadlineSet() {
    this.addSignalDateToArray();
    this.nextDeadline.set(this.deadlineArray[0]);
  }

  clearArray() {
    for (let index = 0; index < this.deadlineArray.length; index++) {
      this.deadlineArray[index] = '';
    }
  }

  addSignalDateToArray() {
    this.clearArray();
    this.addToDoinArray();
    this.addInProgressinArray();
    this.addAwaitFeedbackinArray();
    this.deadlineArray.sort();
  }

  setNextText() {
    let today = new Date().toJSON().slice(0, 10);
    if (this.nextDeadline() < today && this.nextDeadline() != '') this.nextText = 'Passed';
    else this.nextText = 'Upcoming';
    return this.nextText;
  }

  checkCount(data: Task[], prio: string, countIndex: number, deadline: string) {
    for (let index = 0; index < data.length; index++) {
      if (data[index].date == deadline && data[index].prio == prio) this.nextCounts()[countIndex]++;
    }
  }

  countDeadlineUrgent() {
    this.nextCounts()[0] = 0;
    let deadline: string = this.nextDeadline();
    this.checkCount(this.dbService.toDoTasks(), 'Urgent', 0, deadline);
    this.checkCount(this.dbService.inProgressTasks(), 'Urgent', 0, deadline);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Urgent', 0, deadline);

    // if (this.nextCounts()[0] > 0) this.nextCounts()[0] = 0;
    return this.nextCounts()[0];
  }

  countDeadlineMedium() {
    this.nextCounts()[1] = 0;
    let deadline: string = this.nextDeadline();
    this.checkCount(this.dbService.toDoTasks(), 'Medium', 1, deadline);
    this.checkCount(this.dbService.inProgressTasks(), 'Medium', 1, deadline);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Medium', 1, deadline);

    // if (this.nextCounts()[1] == 0) this.nextCounts()[1] = 1;
    return this.nextCounts()[1];
  }

  countDeadlineLow() {
    this.nextCounts()[2] = 0;
    let deadline: string = this.nextDeadline();
    this.checkCount(this.dbService.toDoTasks(), 'Low', 2, deadline);
    this.checkCount(this.dbService.inProgressTasks(), 'Low', 2, deadline);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Low', 2, deadline);

    // if (this.nextCounts()[2] == 0) this.nextCounts()[2] = 1;
    return this.nextCounts()[2];
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
