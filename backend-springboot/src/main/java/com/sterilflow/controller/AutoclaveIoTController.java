package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.dto.AutoclaveTelemetryDto;
import com.sterilflow.model.entity.AutoclaveMachine;
import com.sterilflow.service.AutoclaveIoTService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/autoclaves")
@CrossOrigin(origins = "*")
public class AutoclaveIoTController {

    @Autowired
    private AutoclaveIoTService autoclaveService;

    @GetMapping
    public ApiResponse<List<AutoclaveMachine>> getAllMachines() {
        return ApiResponse.ok("Autoclave machines retrieved", autoclaveService.getAllMachines());
    }

    /**
     * Outbound REST Connector Endpoint
     * Camunda 8 io.camunda:http-json:1 connector queries this endpoint directly during BPMN execution!
     */
    @GetMapping("/{machineCode}/telemetry")
    public AutoclaveTelemetryDto getTelemetry(@PathVariable String machineCode) {
        return autoclaveService.getTelemetry(machineCode);
    }

    @PostMapping("/{machineCode}/simulate-failure")
    public ApiResponse<String> simulateFailure(
            @PathVariable String machineCode,
            @RequestBody Map<String, Boolean> body) {
        boolean fail = body.getOrDefault("fail", true);
        autoclaveService.triggerFailureSimulation(machineCode, fail);
        return ApiResponse.ok("Simulation status updated for " + machineCode + ": failure=" + fail, null);
    }
}