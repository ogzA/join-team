import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../../shared/services/supabase';
import { DatePipe } from '@angular/common';
import { Task } from '../../../shared/models/task';
import { SupabaseAuth } from '../../../shared/services/supabase-auth';

/** Summary page with the task counts, the next deadline and a greeting for the user. */
@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-summary',
  styleUrl: './summary.scss',
  templateUrl: './summary.html',
})
export class Summary {
  dbService = inject(Supabase);
  private auth = inject(SupabaseAuth);
  /** Earliest due date of all tasks that are not done yet. */
  nextDeadline = signal('');
  /** Due dates of all tasks that are not done yet, filled by {@link addSignalDateToArray}. */
  deadlineArray: string[] = [];
  /** "Upcoming" or "Passed", set by {@link setNextText}. */
  nextText: string = 'Upcoming';
  /** Number of tasks due on {@link nextDeadline} per priority: 0 urgent, 1 medium, 2 low. */
  nextCounts = signal<number[]>([]);
  /** False while the mobile welcome screen is shown instead of the summary. */
  isShownSummary = signal(true);
  /** True if the window is narrower than 769px. */
  inMobile = false;
  /** Time when the page was opened; used for the greeting. */
  currentTime: Date = new Date();
  /** {@link currentTime} as German time string (`HH:MM:SS`). */
  timeString = '';
  /** Greeting for the time of day, e.g. "Good morning,". */
  welcomeText = signal('');
  /** Name of the logged-in user, shown below the greeting. */
  loggedUserName = signal('');

  /**
   * Prepares the page: checks the screen size, starts the mobile welcome and sets the greeting
   * and the next deadline.
   */
  async ngOnInit() {
    this.checkScreenSize();
    this.mobileAnimation();
    const name = await this.auth.getUserName();
    this.loggedUserName.set(name);
    this.setWelcomeText();
    this.checkDeadline();
  }

  /** Collects the due dates and sets {@link nextDeadline} to the earliest one. */
  deadlineSet() {
    this.addSignalDateToArray();
    this.nextDeadline.set(this.deadlineArray[0]);
  }

  /** Sets every entry of {@link deadlineArray} to an empty string; the array keeps its length. */
  clearArray() {
    for (let index = 0; index < this.deadlineArray.length; index++) {
      this.deadlineArray[index] = '';
    }
  }

  /**
   * Fills {@link deadlineArray} with the due dates of all tasks that are not done yet and sorts
   * it. `YYYY-MM-DD` strings sort by date, so the earliest date comes first.
   */
  addSignalDateToArray() {
    this.clearArray();
    this.addToDoinArray();
    this.addInProgressinArray();
    this.addAwaitFeedbackinArray();
    this.deadlineArray.sort();
  }

  /**
   * Checks whether {@link nextDeadline} has passed and stores the text in {@link nextText}.
   *
   * @returns "Passed" if the deadline is before today, otherwise "Upcoming".
   */
  setNextText() {
    let today = new Date().toJSON().slice(0, 10);
    if (this.nextDeadline() < today && this.nextDeadline() != '') this.nextText = 'Passed';
    else this.nextText = 'Upcoming';
    return this.nextText;
  }

  /**
   * Counts the tasks with the given priority and due date and adds them to {@link nextCounts}.
   *
   * @param data - The tasks to check.
   * @param prio - Priority to count: "Urgent", "Medium" or "Low".
   * @param countIndex - Index in {@link nextCounts} that gets the count.
   * @param deadline - Due date the tasks must have.
   */
  checkCount(data: Task[], prio: string, countIndex: number, deadline: string) {
    for (let index = 0; index < data.length; index++) {
      if (data[index].date == deadline && data[index].prio == prio) this.nextCounts()[countIndex]++;
    }
  }

  /**
   * Counts the urgent tasks that are not done yet and due on {@link nextDeadline}.
   *
   * @returns The number of these tasks.
   */
  countDeadlineUrgent() {
    this.nextCounts()[0] = 0;
    let deadline: string = this.nextDeadline();
    this.checkCount(this.dbService.toDoTasks(), 'Urgent', 0, deadline);
    this.checkCount(this.dbService.inProgressTasks(), 'Urgent', 0, deadline);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Urgent', 0, deadline);
    return this.nextCounts()[0];
  }

  /**
   * Counts the medium tasks that are not done yet and due on {@link nextDeadline}.
   *
   * @returns The number of these tasks.
   */
  countDeadlineMedium() {
    this.nextCounts()[1] = 0;
    let deadline: string = this.nextDeadline();
    this.checkCount(this.dbService.toDoTasks(), 'Medium', 1, deadline);
    this.checkCount(this.dbService.inProgressTasks(), 'Medium', 1, deadline);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Medium', 1, deadline);
    return this.nextCounts()[1];
  }

  /**
   * Counts the low tasks that are not done yet and due on {@link nextDeadline}.
   *
   * @returns The number of these tasks.
   */
  countDeadlineLow() {
    this.nextCounts()[2] = 0;
    let deadline: string = this.nextDeadline();
    this.checkCount(this.dbService.toDoTasks(), 'Low', 2, deadline);
    this.checkCount(this.dbService.inProgressTasks(), 'Low', 2, deadline);
    this.checkCount(this.dbService.awaitFeedbackTasks(), 'Low', 2, deadline);
    return this.nextCounts()[2];
  }

  /** Appends the due dates of all to-do tasks to {@link deadlineArray}. */
  addToDoinArray() {
    let start = this.deadlineArray.length;
    if (this.dbService.toDoTasks().length > 0) {
      for (let index = 0; index < this.dbService.toDoTasks().length; index++) {
        this.deadlineArray[start] = this.dbService.toDoTasks()[index].date;
        if (index < this.dbService.toDoTasks().length) start++;
      }
    }
  }

  /** Appends the due dates of all tasks in progress to {@link deadlineArray}. */
  addInProgressinArray() {
    let start = this.deadlineArray.length;
    if (this.dbService.inProgressTasks().length > 0) {
      for (let index = 0; index < this.dbService.inProgressTasks().length; index++) {
        this.deadlineArray[start] = this.dbService.inProgressTasks()[index].date;
        if (index < this.dbService.inProgressTasks().length) start++;
      }
    }
  }

  /** Appends the due dates of all tasks awaiting feedback to {@link deadlineArray}. */
  addAwaitFeedbackinArray() {
    let start = this.deadlineArray.length;
    if (this.dbService.awaitFeedbackTasks().length > 0) {
      for (let index = 0; index < this.dbService.awaitFeedbackTasks().length; index++) {
        this.deadlineArray[start] = this.dbService.awaitFeedbackTasks()[index].date;
        if (index < this.dbService.awaitFeedbackTasks().length) start++;
      }
    }
  }

  /**
   * Sets {@link welcomeText} for the time of day: morning (6-12), day (12-18), evening (18-22)
   * or night (22-6). It ends with a comma for registered users and with "!" for guests.
   */
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

  /**
   * Sets the next deadline. If the to-do, in-progress and feedback lists are all empty, it waits
   * 300 ms first, because the tasks may still be loading.
   */
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

  /**
   * On mobile, shows only the welcome screen for 2 seconds before the summary. This happens
   * only once, see {@link SupabaseAuth.firstMobilWelcome}.
   */
  mobileAnimation() {
    if (this.inMobile && !this.auth.firstMobilWelcome()) {
      this.isShownSummary.set(false);
      setTimeout(() => {
        this.isShownSummary.set(true);
        if (this.auth.loggedInStatus()) this.auth.firstMobilWelcome.set(true);
      }, 2000);
    }
  }

  /** Updates {@link inMobile} when the window is resized. */
  @HostListener('window:resize')
  oneResize() {
    this.checkScreenSize();
  }

  /** Updates {@link inMobile} from the current window width. */
  private checkScreenSize() {
    this.inMobile = window.innerWidth < 769;
  }
}
