package com.TransitOps.Backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompanyRegistrationRequest {
    @NotBlank
    private String companyName;
    @NotBlank
    private String registrationDetails;
    @NotBlank
    private String adminFullName;
    @NotBlank @Email
    private String adminEmail;
    @NotBlank @Size(min = 6)
    private String adminPassword;
}
