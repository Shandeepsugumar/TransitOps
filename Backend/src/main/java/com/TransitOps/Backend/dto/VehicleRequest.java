package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class VehicleRequest {
    @NotBlank
    private String registrationNumber;
    @NotBlank
    private String name;
    @NotBlank
    private String type;
    @NotNull @Positive
    private Double maxLoadCapacity;
    @NotNull @PositiveOrZero
    private Double odometer;
    @NotNull @Positive
    private BigDecimal acquisitionCost;
    @NotBlank
    private String status;
    private String region;
}
