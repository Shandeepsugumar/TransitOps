package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.*;
import com.TransitOps.Backend.entity.Vehicle;
import com.TransitOps.Backend.enums.DriverStatus;
import com.TransitOps.Backend.enums.TripStatus;
import com.TransitOps.Backend.enums.VehicleStatus;
import com.TransitOps.Backend.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    public ReportService(VehicleRepository vehicleRepository, DriverRepository driverRepository,
                         TripRepository tripRepository, FuelLogRepository fuelLogRepository,
                         MaintenanceLogRepository maintenanceLogRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
    }

    public DashboardKpiResponse getDashboardKpis() {
        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long onTripVehicles = vehicleRepository.countByStatus(VehicleStatus.ON_TRIP);
        long inMaintenanceVehicles = vehicleRepository.countByStatus(VehicleStatus.IN_SHOP);
        long retiredVehicles = vehicleRepository.countByStatus(VehicleStatus.RETIRED);

        long activeTrips = tripRepository.countByStatus(TripStatus.DISPATCHED);
        long pendingTrips = tripRepository.countByStatus(TripStatus.DRAFT);
        long completedTrips = tripRepository.countByStatus(TripStatus.COMPLETED);

        long driversOnDuty = driverRepository.countByStatus(DriverStatus.ON_TRIP);
        long totalDrivers = driverRepository.count();

        double utilization = totalVehicles > 0
                ? ((double) onTripVehicles / (totalVehicles - retiredVehicles)) * 100.0
                : 0.0;

        return DashboardKpiResponse.builder()
                .totalVehicles(totalVehicles)
                .activeVehicles(onTripVehicles)
                .availableVehicles(availableVehicles)
                .inMaintenanceVehicles(inMaintenanceVehicles)
                .retiredVehicles(retiredVehicles)
                .activeTrips(activeTrips)
                .pendingTrips(pendingTrips)
                .completedTrips(completedTrips)
                .driversOnDuty(driversOnDuty)
                .totalDrivers(totalDrivers)
                .fleetUtilizationPercent(Math.round(utilization * 100.0) / 100.0)
                .build();
    }

    public List<FuelEfficiencyResponse> getFuelEfficiency() {
        return vehicleRepository.findAll().stream().map(v -> {
            Double totalDistance = tripRepository.sumDistanceByVehicleId(v.getId());
            Double totalFuel = tripRepository.sumFuelConsumedByVehicleId(v.getId());
            double efficiency = (totalFuel != null && totalFuel > 0) ? totalDistance / totalFuel : 0.0;

            return FuelEfficiencyResponse.builder()
                    .vehicleId(v.getId())
                    .registrationNumber(v.getRegistrationNumber())
                    .vehicleName(v.getName())
                    .totalDistance(totalDistance != null ? totalDistance : 0.0)
                    .totalFuelConsumed(totalFuel != null ? totalFuel : 0.0)
                    .fuelEfficiency(Math.round(efficiency * 100.0) / 100.0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<OperationalCostResponse> getOperationalCost() {
        return vehicleRepository.findAll().stream().map(v -> {
            BigDecimal fuelCost = fuelLogRepository.sumCostByVehicleId(v.getId());
            BigDecimal maintenanceCost = maintenanceLogRepository.sumCostByVehicleId(v.getId());

            return OperationalCostResponse.builder()
                    .vehicleId(v.getId())
                    .registrationNumber(v.getRegistrationNumber())
                    .fuelCost(fuelCost)
                    .maintenanceCost(maintenanceCost)
                    .totalOperationalCost(fuelCost.add(maintenanceCost))
                    .build();
        }).collect(Collectors.toList());
    }

    public List<VehicleRoiResponse> getVehicleRoi() {
        return vehicleRepository.findAll().stream().map(v -> {
            BigDecimal revenue = tripRepository.sumRevenueByVehicleId(v.getId());
            BigDecimal fuelCost = fuelLogRepository.sumCostByVehicleId(v.getId());
            BigDecimal maintenanceCost = maintenanceLogRepository.sumCostByVehicleId(v.getId());
            BigDecimal acquisitionCost = v.getAcquisitionCost();

            BigDecimal roi = BigDecimal.ZERO;
            if (acquisitionCost.compareTo(BigDecimal.ZERO) > 0) {
                roi = revenue.subtract(maintenanceCost).subtract(fuelCost)
                        .divide(acquisitionCost, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            return VehicleRoiResponse.builder()
                    .vehicleId(v.getId())
                    .registrationNumber(v.getRegistrationNumber())
                    .vehicleName(v.getName())
                    .revenue(revenue)
                    .maintenanceCost(maintenanceCost)
                    .fuelCost(fuelCost)
                    .acquisitionCost(acquisitionCost)
                    .roi(roi.setScale(2, RoundingMode.HALF_UP))
                    .build();
        }).collect(Collectors.toList());
    }

    public void exportCsv(String type, HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + type + "_report.csv\"");
        PrintWriter writer = response.getWriter();

        switch (type) {
            case "fuel-efficiency":
                writer.println("Vehicle ID,Registration,Name,Total Distance,Total Fuel,Efficiency (km/L)");
                getFuelEfficiency().forEach(r ->
                        writer.println(r.getVehicleId() + "," + r.getRegistrationNumber() + "," + r.getVehicleName()
                                + "," + r.getTotalDistance() + "," + r.getTotalFuelConsumed() + "," + r.getFuelEfficiency()));
                break;
            case "operational-cost":
                writer.println("Vehicle ID,Registration,Fuel Cost,Maintenance Cost,Total Cost");
                getOperationalCost().forEach(r ->
                        writer.println(r.getVehicleId() + "," + r.getRegistrationNumber()
                                + "," + r.getFuelCost() + "," + r.getMaintenanceCost() + "," + r.getTotalOperationalCost()));
                break;
            case "roi":
                writer.println("Vehicle ID,Registration,Name,Revenue,Maintenance,Fuel,Acquisition,ROI (%)");
                getVehicleRoi().forEach(r ->
                        writer.println(r.getVehicleId() + "," + r.getRegistrationNumber() + "," + r.getVehicleName()
                                + "," + r.getRevenue() + "," + r.getMaintenanceCost() + "," + r.getFuelCost()
                                + "," + r.getAcquisitionCost() + "," + r.getRoi()));
                break;
            default:
                writer.println("Unknown report type: " + type);
        }
        writer.flush();
    }
}
