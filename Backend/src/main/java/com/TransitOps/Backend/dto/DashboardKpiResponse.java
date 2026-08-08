package com.TransitOps.Backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardKpiResponse {
    private long totalVehicles;
    private long activeVehicles;
    private long availableVehicles;
    private long inMaintenanceVehicles;
    private long retiredVehicles;
    private long activeTrips;
    private long pendingTrips;
    private long completedTrips;
    private long driversOnDuty;
    private long totalDrivers;
    private double fleetUtilizationPercent;
}
