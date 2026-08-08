package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TripCreateRequest {
    @NotBlank
    private String source;
    @NotBlank
    private String destination;
    @NotNull
    private Long vehicleId;
    @NotNull
    private Long driverId;
    @NotNull @Positive
    private Double cargoWeight;
    @NotNull @Positive
    private Double plannedDistance;
    private BigDecimal revenue;
}
