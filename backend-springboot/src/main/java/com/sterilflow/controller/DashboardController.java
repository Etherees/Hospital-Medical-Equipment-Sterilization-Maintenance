package com.sterilflow.controller;

import com.sterilflow.model.dto.ApiResponse;
import com.sterilflow.model.dto.DashboardStatsDto;
import com.sterilflow.service.DashboardAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardAnalyticsService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsDto> getStats() {
        return ApiResponse.ok("Dashboard statistics retrieved", dashboardService.getDashboardStats());
    }
}