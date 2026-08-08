package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OperationalCostResponse {
    private Long vehicleId;
    private String registrationNumber;
    private BigDecimal fuelCost;
    private BigDecimal maintenanceCost;
    private BigDecimal totalOperationalCost;
}
