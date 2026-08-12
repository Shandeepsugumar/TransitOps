package com.TransitOps.Backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String contactNumber;
    private String role;
    private String status;
    private Long companyId;
}
