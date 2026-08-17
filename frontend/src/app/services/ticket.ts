import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TicketModel {
  id?: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TicketModel[]> {
    return this.http.get<TicketModel[]>(this.apiUrl);
  }

  create(ticket: TicketModel): Observable<TicketModel> {
    return this.http.post<TicketModel>(this.apiUrl, ticket);
  }

  updateStatus(id: number, ticket: Partial<TicketModel>): Observable<TicketModel> {
    return this.http.put<TicketModel>(`${this.apiUrl}/${id}`, ticket);
  }
}