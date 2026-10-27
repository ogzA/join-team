import { Component, inject, input, output } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddTask } from '../add-task/add-task';

@Component({
  imports: [AddTask,ReactiveFormsModule],
  selector: 'app-task-details',
  styleUrl: './task-details.scss',
  templateUrl: './task-details.html',
})
export class TaskDetails {
  isDialogOpen: boolean = false;
  isEdit:boolean = false;
  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);

  // accept input data like task id and table id to fetch exact record from supabase.
  // then in loadData function call supabase service method to fetch exact record 


  taskDetailForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/^[A-Za-z][a-zA-Z0-9_ -]*$/)]],
    description: [''],
    date: ['', Validators.required],
    prio: [''],
    assigned: [''],
    category: ['', Validators.required],
    subtasks: [''],
  });


  constructor()
  {
    this.loadData();
  }

  async loadData()
  {
    const data = await this.dbService.loadTasks(2);
    console.log(data)
  }
  async onSubmit()
  {

  }
  editTask()
  {
    this.isEdit = true;
  }
  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

}
