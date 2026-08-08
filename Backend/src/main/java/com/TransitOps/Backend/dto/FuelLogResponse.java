package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FuelLogResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistration;
    private Double liters;
    private BigDecimal cost;
    private String date;
}
