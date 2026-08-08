package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TripCompleteRequest {
    @NotNull @Positive
    private Double finalOdometer;
    @NotNull @Positive
    private Double fuelConsumed;
}
