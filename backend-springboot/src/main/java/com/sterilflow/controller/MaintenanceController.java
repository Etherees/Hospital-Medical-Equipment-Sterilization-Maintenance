package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.entity.MaintenanceRecord;
import com.sterilflow.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping("/tickets")
    public ApiResponse<List<MaintenanceRecord>> getAllTickets(@RequestParam(required = false) String status) {
        List<MaintenanceRecord> list = (status != null && !status.isBlank())
                ? maintenanceService.getRecordsByStatus(status)
                : maintenanceService.getAllRecords();
        return ApiResponse.ok("Maintenance records retrieved", list);
    }

    @PostMapping("/tickets")
    public ApiResponse<MaintenanceRecord> createTicket(@RequestBody MaintenanceRecord ticket) {
        return ApiResponse.ok("Maintenance ticket logged", maintenanceService.createTicket(ticket));
    }

    @PostMapping("/tickets/{ticketNumber}/resolve")
    public ApiResponse<MaintenanceRecord> resolveTicket(
            @PathVariable String ticketNumber,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return ApiResponse.ok("Maintenance ticket resolved", maintenanceService.resolveTicket(ticketNumber, notes));
    }
}