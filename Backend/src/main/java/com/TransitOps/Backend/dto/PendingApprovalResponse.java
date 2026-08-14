package com.TransitOps.Backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PendingApprovalResponse {
    private Long id;
    private String fullName;
    private String email;
    private String contactNumber;
    private String role;
    private String status;
}
