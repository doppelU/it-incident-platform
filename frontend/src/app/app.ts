import { Component } from '@angular/core';
import { TicketList } from './components/ticket-list/ticket-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TicketList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}