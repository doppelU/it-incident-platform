package com.doppelu.incident_platform.repository;

import com.doppelu.incident_platform.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}