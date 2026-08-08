package com.TransitOps.Backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FuelEfficiencyResponse {
    private Long vehicleId;
    private String registrationNumber;
    private String vehicleName;
    private Double totalDistance;
    private Double totalFuelConsumed;
    private Double fuelEfficiency; // distance per liter
}
