import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../../shared/services/supabase';
import { DatePipe } from '@angular/common';
import { Task } from '../../../shared/models/task';
import { SupabaseAuth } from '../../../shared/services/supabase-auth';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-summary',
  styleUrl: './summary.scss',
  templateUrl: './summary.html',
})
export class Summary {
  dbService = inject(Supabase);
  private auth = inject(SupabaseAuth);
  nextDeadline = signal('');
  deadlineArray: string[] = [];
  nextText: string = 'Upcoming';
  nextCounts = signal<number[]>([]);
  isShownSummary = signal(true);
  inMobile = false;
  currentTime: Date = new Date();
  timeString = '';
  welcomeText = signal('');
  loggedUserName = signal('');

  async ngOnInit() {
    this.checkScreenSize();
    this.mobileAnimation();
    const name = await this.auth.getUserName();
    this.loggedUserName.set(name);
    this.setWelcomeText();
    this.checkDeadline();
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

  setWelcomeText() {
    let goodText = 'Good ';
    let dayText = '';
    let commaText = '!';
    this.timeString = this.currentTime.toLocaleTimeString('de-DE');
    if (this.loggedUserName() != '' && this.loggedUserName() != 'Guest') commaText = ',';

    if (this.timeString < '12' && this.timeString >= '06') dayText = 'morning';
    if (this.timeString >= '18' && this.timeString < '23') dayText = 'evening';
    if (this.timeString >= '22' || this.timeString < '06') dayText = 'night';
    if ((this.timeString >= '12' && this.timeString < '18') || this.timeString == '')
      dayText = 'day';

    this.welcomeText.set(goodText + dayText + commaText);
  }

  checkDeadline() {
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

  mobileAnimation() {
    if (this.inMobile && !this.auth.firstMobilWelcome()) {
      this.isShownSummary.set(false);
      setTimeout(() => {
        this.isShownSummary.set(true);
        if (this.auth.loggedInStatus()) this.auth.firstMobilWelcome.set(true);
      }, 2000);
    }
  }

  @HostListener('window:resize')
  oneResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.inMobile = window.innerWidth < 769;
  }
}
