package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.TripCompleteRequest;
import com.TransitOps.Backend.dto.TripCreateRequest;
import com.TransitOps.Backend.dto.TripResponse;
import com.TransitOps.Backend.entity.Driver;
import com.TransitOps.Backend.entity.Trip;
import com.TransitOps.Backend.entity.Vehicle;
import com.TransitOps.Backend.enums.DriverStatus;
import com.TransitOps.Backend.enums.TripStatus;
import com.TransitOps.Backend.enums.VehicleStatus;
import com.TransitOps.Backend.exception.BusinessRuleException;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    public TripService(TripRepository tripRepository, VehicleService vehicleService, DriverService driverService) {
        this.tripRepository = tripRepository;
        this.vehicleService = vehicleService;
        this.driverService = driverService;
    }

    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TripResponse> getTripsByStatus(TripStatus status) {
        return tripRepository.findByStatus(status).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TripResponse createTrip(TripCreateRequest request) {
        Vehicle vehicle = vehicleService.findById(request.getVehicleId());
        Driver driver = driverService.findById(request.getDriverId());

        // Rule #5: cargoWeight must not exceed vehicle's maxLoadCapacity
        if (request.getCargoWeight() > vehicle.getMaxLoadCapacity()) {
            throw new BusinessRuleException("Cargo weight (" + request.getCargoWeight()
                    + " kg) exceeds vehicle max load capacity (" + vehicle.getMaxLoadCapacity() + " kg)");
        }

        Trip trip = Trip.builder()
                .source(request.getSource())
                .destination(request.getDestination())
                .vehicle(vehicle)
                .driver(driver)
                .cargoWeight(request.getCargoWeight())
                .plannedDistance(request.getPlannedDistance())
                .revenue(request.getRevenue())
                .status(TripStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse dispatchTrip(Long tripId) {
        Trip trip = findById(tripId);

        if (trip.getStatus() != TripStatus.DRAFT) {
            throw new BusinessRuleException("Only DRAFT trips can be dispatched. Current status: " + trip.getStatus());
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        // Rule #2: Retired or In Shop vehicles cannot be dispatched
        if (vehicle.getStatus() == VehicleStatus.RETIRED || vehicle.getStatus() == VehicleStatus.IN_SHOP) {
            throw new BusinessRuleException("Vehicle " + vehicle.getRegistrationNumber() + " is " + vehicle.getStatus() + " and cannot be dispatched");
        }

        // Rule #4: Vehicle already ON_TRIP
        if (vehicle.getStatus() == VehicleStatus.ON_TRIP) {
            throw new BusinessRuleException("Vehicle " + vehicle.getRegistrationNumber() + " is already ON_TRIP");
        }

        // Rule #3: Driver with expired license
        if (driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessRuleException("Driver " + driver.getName() + " has an expired license");
        }

        // Rule #3: Suspended driver
        if (driver.getStatus() == DriverStatus.SUSPENDED) {
            throw new BusinessRuleException("Driver " + driver.getName() + " is SUSPENDED and cannot be assigned to trips");
        }

        // Rule #4: Driver already ON_TRIP
        if (driver.getStatus() == DriverStatus.ON_TRIP) {
            throw new BusinessRuleException("Driver " + driver.getName() + " is already ON_TRIP");
        }

        // Rule #5: re-validate cargo weight
        if (trip.getCargoWeight() > vehicle.getMaxLoadCapacity()) {
            throw new BusinessRuleException("Cargo weight exceeds vehicle max load capacity");
        }

        // Rule #6: Atomically set statuses
        trip.setStatus(TripStatus.DISPATCHED);
        vehicle.setStatus(VehicleStatus.ON_TRIP);
        driver.setStatus(DriverStatus.ON_TRIP);

        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse completeTrip(Long tripId, TripCompleteRequest request) {
        Trip trip = findById(tripId);

        if (trip.getStatus() != TripStatus.DISPATCHED) {
            throw new BusinessRuleException("Only DISPATCHED trips can be completed. Current status: " + trip.getStatus());
        }

        // Rule #7: Complete trip, restore statuses
        trip.setStatus(TripStatus.COMPLETED);
        trip.setFinalOdometer(request.getFinalOdometer());
        trip.setFuelConsumed(request.getFuelConsumed());
        trip.setActualDistance(request.getFinalOdometer() - trip.getVehicle().getOdometer());

        Vehicle vehicle = trip.getVehicle();
        vehicle.setOdometer(request.getFinalOdometer());
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        Driver driver = trip.getDriver();
        driver.setStatus(DriverStatus.AVAILABLE);

        return toResponse(tripRepository.save(trip));
    }

    @Transactional
    public TripResponse cancelTrip(Long tripId) {
        Trip trip = findById(tripId);

        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot cancel a trip with status: " + trip.getStatus());
        }

        // Rule #8: If dispatched, restore vehicle/driver to AVAILABLE
        if (trip.getStatus() == TripStatus.DISPATCHED) {
            trip.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            trip.getDriver().setStatus(DriverStatus.AVAILABLE);
        }

        trip.setStatus(TripStatus.CANCELLED);
        return toResponse(tripRepository.save(trip));
    }

    public Trip findById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    private TripResponse toResponse(Trip t) {
        return TripResponse.builder()
                .id(t.getId())
                .source(t.getSource())
                .destination(t.getDestination())
                .vehicleId(t.getVehicle().getId())
                .vehicleRegistration(t.getVehicle().getRegistrationNumber())
                .driverId(t.getDriver().getId())
                .driverName(t.getDriver().getName())
                .cargoWeight(t.getCargoWeight())
                .plannedDistance(t.getPlannedDistance())
                .actualDistance(t.getActualDistance())
                .fuelConsumed(t.getFuelConsumed())
                .finalOdometer(t.getFinalOdometer())
                .revenue(t.getRevenue())
                .status(t.getStatus().name())
                .createdAt(t.getCreatedAt().toString())
                .build();
    }
}
