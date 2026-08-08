package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TripResponse {
    private Long id;
    private String source;
    private String destination;
    private Long vehicleId;
    private String vehicleRegistration;
    private Long driverId;
    private String driverName;
    private Double cargoWeight;
    private Double plannedDistance;
    private Double actualDistance;
    private Double fuelConsumed;
    private Double finalOdometer;
    private BigDecimal revenue;
    private String status;
    private String createdAt;
}
