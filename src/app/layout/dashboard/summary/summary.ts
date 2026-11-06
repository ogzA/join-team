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
  deadline: string = '';
  deadlineArray: string[] = [];
  nextText: string = 'Upcoming';
  nextCounts: number[] = [];

  ngOnInit() {
    setTimeout(() => {
      this.checkNextCounts();
    }, 1000);
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

  checkNextDeadline() {
    this.addSignalDateToArray();
    this.deadline = this.deadlineArray[0];
    return this.deadline;
  }

  setNextText() {
    let today = new Date().toJSON().slice(0, 10);
    if (this.deadline < today && this.deadline != '') this.nextText = 'Passed';
    else this.nextText = 'Upcoming';
    return this.nextText;
  }

  checkNextCounts() {
    this.nextCounts[0] = 0;
    this.nextCounts[1] = 0;
    this.nextCounts[2] = 0;
    console.log(this.deadline);

    this.countDeadlineUrgent();
    this.countDeadlineMedium();
    this.countDeadlineLow();
    console.log('Urgent', this.nextCounts[0]);
    console.log('Medium', this.nextCounts[1]);
    console.log('Low', this.nextCounts[2]);
  }

  checkCount(data: Task[], prio: string, countIndex: number) {
    for (let index = 0; index < data.length; index++) {
      if (data[index].date == this.deadline && data[index].prio == prio)
        this.nextCounts[countIndex]++;
    }
  }

  countDeadlineUrgent() {
    this.checkCount(this.dbService.toDoTasks(), 'Urgent', 0);
    this.checkCount(this.dbService.inProgressTasks(), 'Urgent', 0);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Urgent', 0);
  }

  countDeadlineMedium() {
    this.checkCount(this.dbService.toDoTasks(), 'Medium', 1);
    this.checkCount(this.dbService.inProgressTasks(), 'Medium', 1);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Medium', 1);
  }

  countDeadlineLow() {
    this.checkCount(this.dbService.toDoTasks(), 'Low', 2);
    this.checkCount(this.dbService.inProgressTasks(), 'Low', 2);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Low', 2);
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
