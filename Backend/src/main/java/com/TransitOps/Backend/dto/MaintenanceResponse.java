package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MaintenanceResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistration;
    private String maintenanceType;
    private String description;
    private BigDecimal cost;
    private String date;
    private String status;
}
