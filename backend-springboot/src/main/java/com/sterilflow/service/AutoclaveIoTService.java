package com.sterilflow.service;

import com.sterilflow.model.dto.AutoclaveTelemetryDto;
import com.sterilflow.model.entity.AutoclaveMachine;
import com.sterilflow.repository.AutoclaveMachineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AutoclaveIoTService {

    @Autowired
    private AutoclaveMachineRepository machineRepository;

    // Simulation states for active autoclaves
    private final ConcurrentHashMap<String, Boolean> failureSimulations = new ConcurrentHashMap<>();

    public List<AutoclaveMachine> getAllMachines() {
        return machineRepository.findAll();
    }

    public Optional<AutoclaveMachine> getMachine(String machineCode) {
        return machineRepository.findByMachineCode(machineCode);
    }

    /**
     * Simulated IoT Autoclave Telemetry Feed
     * Emulates live sensors: Chamber RTD PT100 probe, piezoresistive pressure transducer, steam valve position
     */
    public AutoclaveTelemetryDto getTelemetry(String machineCode) {
        AutoclaveMachine machine = machineRepository.findByMachineCode(machineCode)
                .orElseGet(() -> {
                    AutoclaveMachine fallback = new AutoclaveMachine(
                        machineCode, "Siemens SteriGuard 660-X", "STERILIZING", 134.2, 2.22, false, 1420, 6
                    );
                    return machineRepository.save(fallback);
                });

        boolean failRequested = failureSimulations.getOrDefault(machineCode, false);

        AutoclaveTelemetryDto dto = new AutoclaveTelemetryDto();
        dto.setMachineCode(machine.getMachineCode());
        dto.setModel(machine.getModel());
        dto.setTargetTemperature(machine.getTargetTemperature());
        dto.setTargetPressure(machine.getTargetPressure());
        dto.setIsAvailable(machine.getIsAvailable());
        dto.setTimestamp(LocalDateTime.now());

        if (failRequested) {
            dto.setChamberStatus("ALARM_PRESSURE_DROP");
            dto.setCurrentPhase("ALARM_FAILED");
            dto.setCurrentTemperature(128.4); // Below critical 132°C sterilization threshold
            dto.setCurrentPressure(1.68);      // Depressurized
            dto.setCycleProgressPercent(45);
            dto.setChemicalIndicatorStatus("FAIL");
            dto.setBiologicalIndicatorStatus("POSITIVE_CONTAMINATED");
        } else {
            // High precision thermal & pressure fluctuation within ±0.3°C / ±0.03 bar
            long timeSeconds = System.currentTimeMillis() / 1000;
            double tempJitter = Math.sin(timeSeconds / 5.0) * 0.35;
            double pressureJitter = Math.cos(timeSeconds / 4.0) * 0.04;

            dto.setChamberStatus("STERILIZING");
            dto.setCurrentPhase("STERILIZATION_HOLD");
            dto.setCurrentTemperature(Math.round((134.2 + tempJitter) * 100.0) / 100.0);
            dto.setCurrentPressure(Math.round((2.22 + pressureJitter) * 100.0) / 100.0);
            
            int simulatedProgress = (int) ((timeSeconds % 60) * (100.0 / 60.0));
            dto.setCycleProgressPercent(Math.max(65, simulatedProgress));
            dto.setChemicalIndicatorStatus("PASS");
            dto.setBiologicalIndicatorStatus("NEGATIVE_CLEAR");
        }

        return dto;
    }

    public void triggerFailureSimulation(String machineCode, boolean simulateFail) {
        failureSimulations.put(machineCode, simulateFail);
    }
}