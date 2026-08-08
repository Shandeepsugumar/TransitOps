package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VehicleRoiResponse {
    private Long vehicleId;
    private String registrationNumber;
    private String vehicleName;
    private BigDecimal revenue;
    private BigDecimal maintenanceCost;
    private BigDecimal fuelCost;
    private BigDecimal acquisitionCost;
    private BigDecimal roi;
}
