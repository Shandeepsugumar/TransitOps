package com.TransitOps.Backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DriverResponse {
    private Long id;
    private Long userId;
    private String name;
    private String licenseNumber;
    private String licenseCategory;
    private String licenseExpiryDate;
    private String contactNumber;
    private Integer safetyScore;
    private String status;
}
