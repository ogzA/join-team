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
}
