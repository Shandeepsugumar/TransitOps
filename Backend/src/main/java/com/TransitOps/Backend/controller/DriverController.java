package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.DriverRequest;
import com.TransitOps.Backend.dto.DriverResponse;
import com.TransitOps.Backend.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> getAvailableDrivers() {
        return ResponseEntity.ok(driverService.getAvailableDrivers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriver(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'SAFETY_OFFICER')")
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.createDriver(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'SUPER_ADMIN', 'SAFETY_OFFICER')")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }
}
