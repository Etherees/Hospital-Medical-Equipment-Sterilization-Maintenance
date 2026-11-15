package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.dto.CalibrationActionDto;
import com.sterilflow.model.entity.CalibrationRecord;
import com.sterilflow.service.CalibrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calibration")
@CrossOrigin(origins = "*")
public class CalibrationController {

    @Autowired
    private CalibrationService calibrationService;

    @GetMapping("/records")
    public ApiResponse<List<CalibrationRecord>> getAllRecords() {
        return ApiResponse.ok("Calibration records retrieved", calibrationService.getAllRecords());
    }

    @GetMapping("/records/{equipmentId}")
    public ApiResponse<List<CalibrationRecord>> getRecordsForEquipment(@PathVariable String equipmentId) {
        return ApiResponse.ok("Equipment calibration history retrieved", calibrationService.getRecordsForEquipment(equipmentId));
    }

    @PostMapping("/perform")
    public ApiResponse<CalibrationRecord> performCalibration(@RequestBody CalibrationActionDto dto) {
        CalibrationRecord rec = calibrationService.performCalibration(dto);
        return ApiResponse.ok("Calibration recorded and certificate generated", rec);
    }
}