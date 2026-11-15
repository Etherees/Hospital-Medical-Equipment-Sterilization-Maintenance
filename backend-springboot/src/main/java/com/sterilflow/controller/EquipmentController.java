package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.entity.Equipment;
import com.sterilflow.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "*")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @GetMapping
    public ApiResponse<List<Equipment>> getAllEquipment(@RequestParam(required = false) String category) {
        List<Equipment> list = (category != null && !category.isBlank())
                ? equipmentService.getByCategory(category)
                : equipmentService.getAllEquipment();
        return ApiResponse.ok("Equipment list retrieved", list);
    }

    @GetMapping("/{equipmentId}")
    public ApiResponse<Equipment> getEquipmentById(@PathVariable String equipmentId) {
        return equipmentService.getByEquipmentId(equipmentId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error("Equipment not found: " + equipmentId));
    }

    @PostMapping
    public ApiResponse<Equipment> createEquipment(@RequestBody Equipment equipment) {
        return ApiResponse.ok("Equipment created successfully", equipmentService.saveEquipment(equipment));
    }

    @PatchMapping("/{equipmentId}/status")
    public ApiResponse<Equipment> updateStatus(@PathVariable String equipmentId, @RequestParam String status) {
        return ApiResponse.ok("Equipment status updated", equipmentService.updateStatus(equipmentId, status));
    }
}