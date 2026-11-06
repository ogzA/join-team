import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Supabase } from '../../../shared/services/supabase';

@Component({
  imports: [RouterLink],
  selector: 'app-summary',
  styleUrl: './summary.scss',
  templateUrl: './summary.html',
})
export class Summary {
  dbService = inject(Supabase);
  deadline: string = '';

  checkNextDeadline() {
    for (let index = this.dbService.toDoTasks().length - 1; index > 0; index--) {
      // console.log(
      //   index,
      //   '-',
      //   index - 1,
      //   '-',
      //   this.dbService.toDoTasks()[index].date,
      //   '-',
      //   this.dbService.toDoTasks()[index - 1].date,
      // );
      if (this.dbService.toDoTasks()[index].date < this.dbService.toDoTasks()[index - 1].date)
        this.deadline = this.dbService.toDoTasks()[index].date;
    }
    console.log('Deadline nach to do:', this.deadline);

    for (let index = this.dbService.inProgressTasks().length - 1; index > 0; index++) {
      console.log('test', this.dbService.inProgressTasks()[index].date);
      if (
        this.dbService.inProgressTasks()[index].date <
          this.dbService.inProgressTasks()[index + 1].date ||
        this.dbService.inProgressTasks()[index].date < this.deadline
      )
        this.deadline = this.dbService.inProgressTasks()[index].date;
    }
    console.log('Deadline nach in Progress:', this.deadline);

    for (let index = 0; index < this.dbService.awaitFeedbackTasks().length; index++) {
      // console.log(this.dbService.awaitFeedbackTasks()[index].date);
      if (
        index > 0 &&
        (this.dbService.awaitFeedbackTasks()[index].date <
          this.dbService.awaitFeedbackTasks()[index - 1].date ||
          this.dbService.awaitFeedbackTasks()[index].date < this.deadline)
      )
        this.deadline = this.dbService.awaitFeedbackTasks()[index].date;
    }

    console.log('');
    console.log('Deadline:', this.deadline);
  }
}
