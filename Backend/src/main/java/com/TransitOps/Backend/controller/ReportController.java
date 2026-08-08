package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.*;
import com.TransitOps.Backend.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard/kpis")
    public ResponseEntity<DashboardKpiResponse> getDashboardKpis() {
        return ResponseEntity.ok(reportService.getDashboardKpis());
    }

    @GetMapping("/reports/fuel-efficiency")
    public ResponseEntity<List<FuelEfficiencyResponse>> getFuelEfficiency() {
        return ResponseEntity.ok(reportService.getFuelEfficiency());
    }

    @GetMapping("/reports/operational-cost")
    public ResponseEntity<List<OperationalCostResponse>> getOperationalCost() {
        return ResponseEntity.ok(reportService.getOperationalCost());
    }

    @GetMapping("/reports/roi")
    public ResponseEntity<List<VehicleRoiResponse>> getVehicleRoi() {
        return ResponseEntity.ok(reportService.getVehicleRoi());
    }

    @GetMapping("/reports/export/csv")
    public void exportCsv(@RequestParam String type, HttpServletResponse response) throws IOException {
        reportService.exportCsv(type, response);
    }
}
