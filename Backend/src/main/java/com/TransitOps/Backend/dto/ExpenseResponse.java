package com.TransitOps.Backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistration;
    private String type;
    private BigDecimal amount;
    private String date;
    private String notes;
}
