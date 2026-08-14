package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class JoinCompanyRequest {
    @NotNull
    private Long companyId;
    @NotBlank
    private String fullName;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
    private String contactNumber;
    @NotBlank
    private String role;
}
