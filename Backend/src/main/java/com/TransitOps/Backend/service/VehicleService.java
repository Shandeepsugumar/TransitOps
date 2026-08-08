package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.VehicleRequest;
import com.TransitOps.Backend.dto.VehicleResponse;
import com.TransitOps.Backend.entity.Vehicle;
import com.TransitOps.Backend.enums.VehicleStatus;
import com.TransitOps.Backend.exception.DuplicateResourceException;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<VehicleResponse> getAvailableVehicles() {
        return vehicleRepository.findByStatusNotIn(Arrays.asList(VehicleStatus.RETIRED, VehicleStatus.IN_SHOP))
                .stream().filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                .map(this::toResponse).collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Vehicle with registration " + request.getRegistrationNumber() + " already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .name(request.getName())
                .type(request.getType())
                .maxLoadCapacity(request.getMaxLoadCapacity())
                .odometer(request.getOdometer())
                .acquisitionCost(request.getAcquisitionCost())
                .status(VehicleStatus.valueOf(request.getStatus()))
                .region(request.getRegion())
                .build();

        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = findById(id);

        // Check for unique registration if it changed
        if (!vehicle.getRegistrationNumber().equals(request.getRegistrationNumber())
                && vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Vehicle with registration " + request.getRegistrationNumber() + " already exists");
        }

        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setName(request.getName());
        vehicle.setType(request.getType());
        vehicle.setMaxLoadCapacity(request.getMaxLoadCapacity());
        vehicle.setOdometer(request.getOdometer());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        vehicle.setStatus(VehicleStatus.valueOf(request.getStatus()));
        vehicle.setRegion(request.getRegion());

        return toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = findById(id);
        vehicle.setStatus(VehicleStatus.RETIRED);
        vehicleRepository.save(vehicle);
    }

    public Vehicle findById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    private VehicleResponse toResponse(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getId())
                .registrationNumber(v.getRegistrationNumber())
                .name(v.getName())
                .type(v.getType())
                .maxLoadCapacity(v.getMaxLoadCapacity())
                .odometer(v.getOdometer())
                .acquisitionCost(v.getAcquisitionCost())
                .status(v.getStatus().name())
                .region(v.getRegion())
                .build();
    }
}
