import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { Supabase } from '../../../../shared/services/supabase';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignedToDropdown } from '../../../../shared/assigned-to-dropdown/assigned-to-dropdown';
import { SelectedTask, Subtask } from '../../../../shared/models/task';
import { TitleCasePipe } from '@angular/common';
import { NameLogo } from '../../../../shared/services/name-logo';

@Component({
  imports: [ReactiveFormsModule, AssignedToDropdown,TitleCasePipe],
  selector: 'app-show-task-details',
  styleUrl: './show-task-details.scss',
  templateUrl: './show-task-details.html',
})
export class ShowTaskDetails {
  isEdit = signal(false);
  subtaskInfo: boolean = false;
  editingIndex: number | null = null;
  editedTask: string = ''; 
  isClosing = signal(false);

  priorityLogos = {
  low: "assets/icons/prio-low.svg",
  medium: "assets/icons/prio-medium.svg",
  urgent: "assets/icons/prio-urgent.svg",
  };

  subtasks: Subtask[]=[];
  assigned = signal<string[]>([]);

  selected = input.required<SelectedTask>();
  // taskData = computed(() => this.selected()); 

  close = output<void>();

  private dbService = inject(Supabase);
  private fb = inject(FormBuilder);
  protected nlService = inject(NameLogo);


  taskDetailForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/^[A-ZÄÖÜßa-zäöüẞ][a-zäöüẞA-ZÄÖÜß0-9_ -]*$/)]],
    description: [''],
    date: ['', Validators.required],
    prio: [''],
    assigned: [''],
    subtasks: [''],
  });

constructor()
{
    effect(() => {
      console.log(this.selected());
    });
}
  
  async onSubmit()
  {
    if (this.taskDetailForm.invalid) {
    this.taskDetailForm.markAllAsTouched();
    return;
    }
    const { title, description, date, prio } = this.taskDetailForm.getRawValue();
    const updated = {
      ...this.selected().task,
      title, description, date, prio,
      subtasks: this.subtasks,
      assigned: this.assigned(),
    };
    console.log(updated);
   // await this.dbService.editTask(updated,this.selected().rowId,this.selected().index,);
    this.isEdit.set(false);
  }

  deleteTask()
  {
    //code for delete will go here..
  }

  toInputDate(date: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;   // already correct
    const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);  // dd/mm/yyyy
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  editTask()
  {
    const task = this.selected().task;

    // reset(values) fills the form and clears any old touched/dirty fileds
    this.taskDetailForm.reset({
      title: task.title,
      description: task.description,
      date: this.toInputDate(task.date),
      prio: task.prio.charAt(0).toUpperCase() + task.prio.slice(1).toLowerCase(),
    });
    // copy the lists so editing doesn't change the displayed task before saving
    this.subtasks = task.subtasks.map((s) => ({ ...s }));
    this.assigned.set([...task.assigned]);
    this.isEdit.set(true);
  }

toggleSubtask(event: Event, index: number): void {
  const done = (event.target as HTMLInputElement).checked;
  this.selected().task.subtasks[index].done = done;
  console.log( this.selected())
}


  closeDialog(): void {
    if (this.isClosing()) return;
    this.isClosing.set(true);          
    setTimeout(() => {
        this.close.emit();
    }, 300);    
    }

    deleteSubTask(index:number) {
      this.subtasks.splice(index,1);
    }

    subtaskEdit(index:number) {
      this.editingIndex = index;
      this.editedTask = this.subtasks[index].task;
    }
    deleteEditTask()
    {
      this.editingIndex = null;
      this.editedTask = "";
    }

  confirmEditedTask(index:number){
    const value = this.editedTask.trim();
    if (!value) {
      return;
    }
    this.subtasks[index] = {
      ...this.subtasks[index],
      task: value
    };
    this.editingIndex = null;
    this.editedTask = '';
  }

  closeSubtask() {
    this.taskDetailForm.get('subtasks')?.reset('');
    this.subtaskInfo = false;
  }

  addSubtask() {
    const control = this.taskDetailForm.get('subtasks');
    const value = control?.value?.trim();
    if (!value) {
      return;
    }
    this.subtasks.push({task:value,done:false});
    control?.reset('');
    this.subtaskInfo = false;
  }

  showAddSubTask() {
    this.subtaskInfo = true;
    const value = this.taskDetailForm.get('subtasks')?.value ?? '';
    this.subtaskInfo = value.trim().length > 0;
  }

}
