package com.TransitOps.Backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String registrationDetails;
    private String status;
    private LocalDateTime createdAt;
}
