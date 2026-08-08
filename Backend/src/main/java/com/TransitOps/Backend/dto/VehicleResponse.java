package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String registrationNumber;
    private String name;
    private String type;
    private Double maxLoadCapacity;
    private Double odometer;
    private BigDecimal acquisitionCost;
    private String status;
    private String region;
}
