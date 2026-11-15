package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.entity.Instrument;
import com.sterilflow.model.entity.InstrumentTray;
import com.sterilflow.service.InstrumentTrayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trays")
@CrossOrigin(origins = "*")
public class InstrumentTrayController {

    @Autowired
    private InstrumentTrayService trayService;

    @GetMapping
    public ApiResponse<List<InstrumentTray>> getAllTrays(@RequestParam(required = false) String department) {
        List<InstrumentTray> trays = (department != null && !department.isBlank())
                ? trayService.getTraysByDepartment(department)
                : trayService.getAllTrays();
        return ApiResponse.ok("Instrument trays retrieved", trays);
    }

    @GetMapping("/{trayId}")
    public ApiResponse<InstrumentTray> getTray(@PathVariable String trayId) {
        return trayService.getTrayByCode(trayId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error("Tray not found: " + trayId));
    }

    @PatchMapping("/instruments/{instrumentCode}/status")
    public ApiResponse<Instrument> updateInstrumentStatus(
            @PathVariable String instrumentCode,
            @RequestBody Map<String, String> body) {
        String sterilStatus = body.get("sterilizationStatus");
        String contamStatus = body.get("contaminationStatus");
        Instrument updated = trayService.updateInstrumentStatus(instrumentCode, sterilStatus, contamStatus);
        return ApiResponse.ok("Instrument status updated", updated);
    }
}