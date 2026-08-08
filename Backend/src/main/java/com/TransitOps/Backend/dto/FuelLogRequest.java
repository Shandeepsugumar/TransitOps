package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FuelLogRequest {
    @NotNull
    private Long vehicleId;
    @NotNull @Positive
    private Double liters;
    @NotNull @Positive
    private BigDecimal cost;
    @NotBlank
    private String date;
}
