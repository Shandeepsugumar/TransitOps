package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaintenanceRequest {
    @NotNull
    private Long vehicleId;
    @NotBlank
    private String maintenanceType;
    private String description;
    @NotNull @Positive
    private BigDecimal cost;
    @NotBlank
    private String date;
}
