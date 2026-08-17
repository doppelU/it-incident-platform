import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService, TicketModel } from '../../services/ticket';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketList implements OnInit {
  tickets: TicketModel[] = [];
  newTitle = '';
  newDescription = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getAll().subscribe(data => this.tickets = data);
  }

  createTicket(): void {
    if (!this.newTitle.trim()) return;

    const ticket: TicketModel = {
      title: this.newTitle,
      description: this.newDescription,
      status: 'OPEN',
      priority: 'MEDIUM'
    };

    this.ticketService.create(ticket).subscribe(() => {
      this.newTitle = '';
      this.newDescription = '';
      this.loadTickets();
    });
  }

  changeStatus(ticket: TicketModel, newStatus: TicketModel['status']): void {
    this.ticketService.updateStatus(ticket.id!, { status: newStatus }).subscribe(() => {
      this.loadTickets();
    });
  }
}