import { T } from '@angular/cdk/keycodes';
import { computed, Service, WritableSignal, signal } from '@angular/core';
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
  // [index: number]: {
  category: string;
  title: string;
  description: string;
  date: string;
  prio: string;
  assigned?: string[];
  subtasks?: {}[];
  // };
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
    // Test Array ohne Typisierung
    // let arr = [
    //   {
    //     category: 'User Story',
    //     title: 'Kochwelt Page & Recipe Recommender',
    //     description: 'Build start page with recipe recommendation.',
    //     date: '10/05/2023',
    //     prio: 'Medium',
    //     assigned: ['Emannuel Mauer', 'Marcel Bauer', 'Anton Mayer'],
    //     subtasks: [
    //       { task: 'Implement Recipe Recommedation', done: true },
    //       { task: 'Start Page Layout', done: false },
    //     ],
    //   },
    //   {
    //     category: 'Technical Task',
    //     title: 'HTML Base Template Creation',
    //     description: 'Create reusable HTML Base templates...',
    //     date: '31/12/2026',
    //     prio: 'Low',
    //     assigned: ['Sofia Müller', 'Anja Schulz', 'Benedikt Ziegler', 'Davis Eisenberg'],
    //     subtasks: [
    //       { task: 'Create HTML Base Template', done: false },
    //       { task: 'Make it resuable', done: false },
    //     ],
    //   },
    // ];

    setTimeout(() => {
      console.log('To Do: ', this.toDoTasks());
      // console.log('In Progress: ', this.inProgressTasks());
      // console.log('Await Feedback: ', this.awaitFeedbackTasks());
      // console.log('Done: ', this.doneTasks());

      // Parameter - 1 Signal von den 4 Tasks , Row Id von supabase
      // this.setTasks(this.toDoTasks(), 3);

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

      // Task Obj welches in ein Signal gepeichert werden soll
      // Nummer 1-4 welches Signal genutzt werden soll
      this.addTask(obj, 1);
    }, 1000);
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

  async setTasks(data: Task, rowID: number) {
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

  addTask(object: Task, rowID: number) {
    setTimeout(() => {
      if (rowID == 1) {
        console.log(this.toDoTasks());
        this.toDoTasks().push(object);
        console.log('Test: ', object);
        console.log(this.toDoTasks());
        // this.setTasks(this.toDoTasks(), rowID);
      } else if (rowID == 2) {
        console.log(this.inProgressTasks());
        this.inProgressTasks().push(object);
        console.log('Test: ', object);
        console.log(this.inProgressTasks());
      } else if (rowID == 3) {
        console.log(this.awaitFeedbackTasks());
        this.awaitFeedbackTasks().push(object);
        console.log('Test: ', object);
        console.log(this.awaitFeedbackTasks());
      } else if (rowID == 4) {
        console.log(this.doneTasks());
        this.doneTasks().push(object);
        console.log('Test: ', object);
        console.log(this.doneTasks());
      }
    }, 1000);
  }

  editTask() {}

  deleteTask() {}

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

  async setContact(contact: { name: string; email: string; phone: string; role: string }) {
    const { error } = await this.supabase.from('contacts').insert([contact]);
    if (error) throw error;
    await this.getContacts();
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
