package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.MaintenanceRequest;
import com.TransitOps.Backend.dto.MaintenanceResponse;
import com.TransitOps.Backend.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceResponse>> getMaintenanceLogs(@RequestParam(required = false) Long vehicleId) {
        if (vehicleId != null) {
            return ResponseEntity.ok(maintenanceService.getByVehicleId(vehicleId));
        }
        return ResponseEntity.ok(maintenanceService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<MaintenanceResponse> createMaintenanceLog(@Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(maintenanceService.createMaintenanceLog(request));
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN')")
    public ResponseEntity<MaintenanceResponse> closeMaintenanceLog(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.closeMaintenanceLog(id));
    }
}
