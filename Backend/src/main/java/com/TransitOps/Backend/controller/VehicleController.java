package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.VehicleRequest;
import com.TransitOps.Backend.dto.VehicleResponse;
import com.TransitOps.Backend.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/available")
    public ResponseEntity<List<VehicleResponse>> getAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.createVehicle(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
