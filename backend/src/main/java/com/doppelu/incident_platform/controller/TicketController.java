package com.doppelu.incident_platform.controller;

import com.doppelu.incident_platform.model.Ticket;
import com.doppelu.incident_platform.repository.TicketRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketRepository repo;

    public TicketController(TicketRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Ticket> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Ticket create(@RequestBody Ticket ticket) {
        return repo.save(ticket);
    }

    @PutMapping("/{id}")
    public Ticket updateStatus(@PathVariable Long id, @RequestBody Ticket update) {
        Ticket t = repo.findById(id).orElseThrow();
        t.setStatus(update.getStatus());
        return repo.save(t);
    }
}