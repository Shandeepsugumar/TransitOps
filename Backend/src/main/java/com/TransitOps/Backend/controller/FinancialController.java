package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.*;
import com.TransitOps.Backend.service.FinancialService;
import com.TransitOps.Backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FinancialController {

    private final FinancialService financialService;
    private final ReportService reportService;

    public FinancialController(FinancialService financialService, ReportService reportService) {
        this.financialService = financialService;
        this.reportService = reportService;
    }

    // --- Fuel Logs ---
    @GetMapping("/fuel-logs")
    public ResponseEntity<List<FuelLogResponse>> getFuelLogs(@RequestParam(required = false) Long vehicleId) {
        return ResponseEntity.ok(financialService.getFuelLogs(vehicleId));
    }

    @PostMapping("/fuel-logs")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'FINANCIAL_ANALYST')")
    public ResponseEntity<FuelLogResponse> createFuelLog(@Valid @RequestBody FuelLogRequest request) {
        return ResponseEntity.ok(financialService.createFuelLog(request));
    }

    // --- Expenses ---
    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@RequestParam(required = false) Long vehicleId) {
        return ResponseEntity.ok(financialService.getExpenses(vehicleId));
    }

    @PostMapping("/expenses")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'FINANCIAL_ANALYST')")
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(financialService.createExpense(request));
    }

    // --- Operational Cost per vehicle ---
    @GetMapping("/vehicles/{id}/operational-cost")
    public ResponseEntity<OperationalCostResponse> getOperationalCost(@PathVariable Long id) {
        List<OperationalCostResponse> costs = reportService.getOperationalCost();
        return costs.stream()
                .filter(c -> c.getVehicleId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
