package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExpenseRequest {
    @NotNull
    private Long vehicleId;
    @NotBlank
    private String type;
    @NotNull @Positive
    private BigDecimal amount;
    @NotBlank
    private String date;
    private String notes;
}
