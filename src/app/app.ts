import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './shared/services/supabase';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [RouterOutlet, JsonPipe],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join-team');

  //Service Inject, später auch in anderen Komponenten nutzbar
  dbService = inject(Supabase);

  ngOnInit() {
    //Daten laden vom Supabase Server beim Seitenladen
    // this.dbService.getContacts();
    // this.dbService.getUser();
    this.dbService.loadData();

    // Methoden Aufruf vom supabase Service für das Hinzufügen von Kontakten/Usern
    // Wichtig für spätere Komponenten, dort nur Daten mit Input, nicht im Code, hier nur als test
    // this.dbService.setContacts({name:"TestUser",email:"test@mail.com",phone:0,role:"dummy"});
    // this.dbService.setUser({email:"test@mail.com",password:"1234",role:"dummy"});
  }
}
