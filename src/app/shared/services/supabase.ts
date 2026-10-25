import { computed, Service, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

interface Contact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface User {
  email: string;
  password: string;
  role: string;
}

interface Task {
  category: string;
  title: string;
  description: string;
  date: string;
  prio: string;
  assigned?: string[];
  subtasks?: {}[];
}

interface TaskArray {
  [index: number]: {
    category: string;
    title: string;
    description: string;
    date: string;
    prio: string;
    assigned?: string[];
    subtasks?: {}[];
  };
}

@Service()
export class Supabase {
  supabseUrl = 'https://lvreicyjypltqvutgvly.supabase.co';
  supabaseKey = 'sb_publishable_iELLkIsUUv19dITy-f83Rw_nH8U3yof';
  supabase = createClient(this.supabseUrl, this.supabaseKey);

  // Für Datentypen am besten später Interfaces einbauen
  contacts = signal<
    { id: number; created_at: string; name: string; email: string; phone: string; role: string }[]
  >([]);

  user = signal<
    { id: number; created_at: string; email: string; password: string; role: string }[]
  >([]);

  // Task Signal Arrays with Objects
  toDoTasks = signal<
    {
      category: string;
      title: string;
      description: string;
      date: string;
      prio: string;
      assigned?: string[];
      subtasks?: {}[];
    }[]
  >([]);

  inProgressTasks = signal<
    {
      category: string;
      title: string;
      description: string;
      date: string;
      prio: string;
      assigned?: string[];
      subtasks?: {}[];
    }[]
  >([]);

  awaitFeedbackTasks = signal<
    {
      category: string;
      title: string;
      description: string;
      date: string;
      prio: string;
      assigned?: string[];
      subtasks?: {}[];
    }[]
  >([]);

  doneTasks = signal<
    {
      category: string;
      title: string;
      description: string;
      date: string;
      prio: string;
      assigned?: string[];
      subtasks?: {}[];
    }[]
  >([]);

  channels: RealtimeChannel | undefined;

  loadData() {
    this.getContacts();
    this.getUser();

    // this.channels = this.supabase
    //   .channel('changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'contacts',
    //     },
    //     (payload) => {
    //       console.log(payload);
    //       let tmpContact = payload.new as Contact;
    //       console.log(tmpContact);
    //       // this.setContact(tmpContact); //Noch fehlerhaft, da id und zeitstempel noch mit dabei
    //     },
    //   )
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'user',
    //     },
    //     (payload) => {
    //       console.log(payload);
    //       let tmpUser = payload.new as User;
    //       console.log(tmpUser);
    //       // this.setUser(tmpUser); //Noch fehlerhaft, da id und zeitstempel noch mit dabei
    //     },
    //   )
    //   .subscribe();
  }

  //Ab Hier Task Tests
  setDataTest() {
    setTimeout(() => {
      // Obj Beispiel wie ein Task Objekt aussehen muss um es in ein Signal Array speichern zu können
      // Task Interface später einbauen
      let obj: {
        category: string;
        title: string;
        description: string;
        date: string;
        prio: string;
        assigned?: string[];
        subtasks?: {}[];
      } = {
        category: 'User Story Test',
        title: 'Kochwelt Page & Recipe Recommender',
        description: 'Build start page with recipe recommendation.',
        date: '10/05/2023',
        prio: 'Medium',
        assigned: ['Emannuel Mauer', 'Marcel Bauer', 'Anton Mayer'],
        subtasks: [
          { task: 'Implement Recipe Recommedation', done: true },
          { task: 'Start Page Layout', done: false },
        ],
      };

      // console.log('To Do: ', this.toDoTasks());
      // console.log('In Progress: ', this.inProgressTasks());
      // console.log('Await Feedback: ', this.awaitFeedbackTasks());
      // console.log('Done: ', this.doneTasks());

      // Parameter - 1 Signal von den 4 Tasks , Row Id von supabase
      // this.setTasks(this.toDoTasks(), 3);

      // Task Objekt welches in ein Signal gepeichert werden soll
      // this.addTaskToDo(obj);
      // this.addTaskInProgress(obj);
      // this.addTaskAwaitFeedback(obj);
      // this.addTaskDoneTasks(obj);

      // Signal Array, Table Row ID zum Speichern, Neue Daten als Objekt, Array Index für Datenedit
      // this.editTask(this.doneTasks(), 4, obj, 1);

      // Index vom Signal Array
      // this.deleteTaskToDo(0);
      // this.deleteTaskInProgress(0);
      // this.deleteTaskAwaitFeedback(0);
      // this.deleteTaskDoneTasks(0);
    }, 2000);
  }

  async getTasks() {
    this.toDoTasks.set((await this.loadTasks(1)) ?? ([] as Task[]));
    this.inProgressTasks.set((await this.loadTasks(2)) ?? ([] as Task[]));
    this.awaitFeedbackTasks.set((await this.loadTasks(3)) ?? ([] as Task[]));
    this.doneTasks.set((await this.loadTasks(4)) ?? ([] as Task[]));
  }

  async loadTasks(tableID: number) {
    const response: any = await this.supabase.from('tasks').select('taskjson').eq('id', tableID);
    if (!response) return;
    return response.data[0].taskjson[0];
  }

  async setTasks(data: TaskArray, rowID: number) {
    // supabase table rowIDS
    // to Do - 1
    // in Progress - 2
    // await Feedback - 3
    // done - 4
    const { error } = await this.supabase
      .from('tasks')
      .update({ taskjson: [data] })
      .eq('id', rowID);
    if (error) throw error;
    await this.getTasks();
  }

  addTaskToDo(object: Task) {
    this.toDoTasks().push(object);
    this.setTasks(this.toDoTasks(), 1);
  }

  addTaskInProgress(object: Task) {
    this.inProgressTasks().push(object);
    this.setTasks(this.inProgressTasks(), 2);
  }

  addTaskAwaitFeedback(object: Task) {
    this.awaitFeedbackTasks().push(object);
    this.setTasks(this.awaitFeedbackTasks(), 3);
  }

  addTaskDoneTasks(object: Task) {
    this.doneTasks().push(object);
    this.setTasks(this.doneTasks(), 4);
  }

  editTask(data: TaskArray, rowID: number, object: Task, index: number) {
    let length = this.checkLength(data, index);

    if (data[index] && object && length > index) {
      data[index] = object;
      this.setTasks(data, rowID);
    } else {
      console.log('Keine Daten zum bearbeiten gefunden...');
    }
  }

  checkLength(data: TaskArray, index: number) {
    let length = 0;
    if (data[index] !== undefined) {
      while (data[length] !== undefined) {
        length++;
      }
    }
    return length;
  }

  deleteTaskToDo(index: number) {
    if (this.toDoTasks().length > index) {
      this.toDoTasks().splice(index, 1);
      this.setTasks(this.toDoTasks(), 1);
    } else console.log('ToDo Index', index, 'nicht gefunden...');
  }

  deleteTaskInProgress(index: number) {
    if (this.inProgressTasks().length > index) {
      this.inProgressTasks().splice(index, 1);
      this.setTasks(this.inProgressTasks(), 2);
    } else console.log('InProgress Index', index, 'nicht gefunden...');
  }

  deleteTaskAwaitFeedback(index: number) {
    if (this.awaitFeedbackTasks().length > index) {
      this.awaitFeedbackTasks().splice(index, 1);
      this.setTasks(this.awaitFeedbackTasks(), 3);
    } else console.log('AwaitFeedback Index', index, 'nicht gefunden...');
  }

  deleteTaskDoneTasks(index: number) {
    if (this.doneTasks().length > index) {
      this.doneTasks().splice(index, 1);
      this.setTasks(this.doneTasks(), 4);
    } else console.log('DoneTasks Index', index, 'nicht gefunden...');
  }

  // Task Tests Ende

  ngOnDestroy() {
    if (this.channels) this.supabase.removeChannel(this.channels);
  }

  async getContacts() {
    let response = await this.supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });
    if (!response) return;
    this.contacts.set(response.data ?? ([] as Contact[]));
    // console.log(this.contacts());
  }

  async getUser() {
    let response = await this.supabase.from('user').select('*');
    if (!response) return;
    this.user.set(response.data ?? ([] as User[]));
  }

  // Legt einen Kontakt an und gibt die gespeicherte Zeile inkl. id zurück
  async setContact(contact: { name: string; email: string; phone: string; role: string }) {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert([contact])
      .select() // gespeicherte Zeile zurückgeben
      .single(); // als Objekt statt Array
    if (error) throw error;
    await this.getContacts();
    return data;
  }

  async setUser(user: { email: string; password: string; role: string }) {
    const { data, error } = await this.supabase.from('user').insert([user]).select();
  }

  async updateContact(id: number, contact: { name: string; email: string; phone: string }) {
    const { error } = await this.supabase.from('contacts').update(contact).eq('id', id);
    if (error) throw error;
    await this.getContacts();
  }

  async updateUser(id: number) {
    const { data: error } = await this.supabase
      .from('user')
      //Bei Update später mit Input Eingaben jenachdem was angepasst werden soll mit Parameter Übergabe
      .update({ name: 'Neuer Wert' })
      .eq('id', id)
      .select();
  }

  async deleteContact(id: number) {
    const { error } = await this.supabase.from('contacts').delete().eq('id', id);
    if (error) throw error;
    await this.getContacts();
  }

  async deleteUser(id: number) {
    const { data: error } = await this.supabase.from('user').delete().eq('id', id);
  }

  selectedContactId = signal<number | null>(null);

  selectedContact = computed(() => {
    return this.contacts().find((contact) => contact.id === this.selectedContactId());
  });

  selectContact(id: number) {
    this.selectedContactId.set(id);
  }
}
