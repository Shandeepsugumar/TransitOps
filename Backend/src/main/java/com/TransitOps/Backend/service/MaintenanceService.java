package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.MaintenanceRequest;
import com.TransitOps.Backend.dto.MaintenanceResponse;
import com.TransitOps.Backend.entity.MaintenanceLog;
import com.TransitOps.Backend.entity.Vehicle;
import com.TransitOps.Backend.enums.MaintenanceStatus;
import com.TransitOps.Backend.enums.VehicleStatus;
import com.TransitOps.Backend.exception.BusinessRuleException;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.MaintenanceLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleService vehicleService;

    public MaintenanceService(MaintenanceLogRepository maintenanceLogRepository, VehicleService vehicleService) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.vehicleService = vehicleService;
    }

    public List<MaintenanceResponse> getByVehicleId(Long vehicleId) {
        return maintenanceLogRepository.findByVehicleId(vehicleId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getAll() {
        return maintenanceLogRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceResponse createMaintenanceLog(MaintenanceRequest request) {
        Vehicle vehicle = vehicleService.findById(request.getVehicleId());

        // Rule #9: Creating ACTIVE MaintenanceLog sets vehicle to IN_SHOP
        MaintenanceLog log = MaintenanceLog.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .cost(request.getCost())
                .date(LocalDate.parse(request.getDate()))
                .status(MaintenanceStatus.ACTIVE)
                .build();

        vehicle.setStatus(VehicleStatus.IN_SHOP);
        return toResponse(maintenanceLogRepository.save(log));
    }

    @Transactional
    public MaintenanceResponse closeMaintenanceLog(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found with id: " + id));

        if (log.getStatus() == MaintenanceStatus.CLOSED) {
            throw new BusinessRuleException("Maintenance log is already closed");
        }

        log.setStatus(MaintenanceStatus.CLOSED);

        // Rule #10: Restore vehicle status to AVAILABLE unless RETIRED
        Vehicle vehicle = log.getVehicle();
        if (vehicle.getStatus() != VehicleStatus.RETIRED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }

        return toResponse(maintenanceLogRepository.save(log));
    }

    private MaintenanceResponse toResponse(MaintenanceLog m) {
        return MaintenanceResponse.builder()
                .id(m.getId())
                .vehicleId(m.getVehicle().getId())
                .vehicleRegistration(m.getVehicle().getRegistrationNumber())
                .maintenanceType(m.getMaintenanceType())
                .description(m.getDescription())
                .cost(m.getCost())
                .date(m.getDate().toString())
                .status(m.getStatus().name())
                .build();
    }
}
