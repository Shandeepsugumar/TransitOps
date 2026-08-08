package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.TripCompleteRequest;
import com.TransitOps.Backend.dto.TripCreateRequest;
import com.TransitOps.Backend.dto.TripResponse;
import com.TransitOps.Backend.enums.TripStatus;
import com.TransitOps.Backend.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getTrips(@RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(tripService.getTripsByStatus(TripStatus.valueOf(status)));
        }
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DRIVER')")
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripCreateRequest request) {
        return ResponseEntity.ok(tripService.createTrip(request));
    }

    @PutMapping("/{id}/dispatch")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<TripResponse> dispatchTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.dispatchTrip(id));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'DRIVER')")
    public ResponseEntity<TripResponse> completeTrip(@PathVariable Long id, @Valid @RequestBody TripCompleteRequest request) {
        return ResponseEntity.ok(tripService.completeTrip(id, request));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<TripResponse> cancelTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.cancelTrip(id));
    }
}
