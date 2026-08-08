package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DriverRequest {
    private Long userId;
    @NotBlank
    private String name;
    @NotBlank
    private String licenseNumber;
    @NotBlank
    private String licenseCategory;
    @NotBlank
    private String licenseExpiryDate;
    @NotBlank
    private String contactNumber;
    @NotNull @Min(0) @Max(100)
    private Integer safetyScore;
    @NotBlank
    private String status;
}
