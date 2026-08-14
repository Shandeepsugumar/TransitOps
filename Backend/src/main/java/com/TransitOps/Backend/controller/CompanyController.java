package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.*;
import com.TransitOps.Backend.security.SecurityUtils;
import com.TransitOps.Backend.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/companies/register")
    public ResponseEntity<Map<String, String>> registerCompany(@Valid @RequestBody CompanyRegistrationRequest request) {
        companyService.registerCompany(request);
        return ResponseEntity.ok(Map.of("message", "Company created successfully. You can now sign in."));
    }

    @PostMapping("/companies/join")
    public ResponseEntity<Map<String, String>> joinCompany(@Valid @RequestBody JoinCompanyRequest request) {
        companyService.joinCompany(request);
        return ResponseEntity.ok(Map.of("message", "Your join request has been submitted. The company administrator will review it."));
    }

    @GetMapping("/companies/search")
    public ResponseEntity<List<CompanyResponse>> searchCompanies(@RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(companyService.searchCompanies(q));
    }

    @GetMapping("/companies/pending-approvals")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<PendingApprovalResponse>> getPendingApprovals() {
        Long companyId = SecurityUtils.getCompanyId();
        return ResponseEntity.ok(companyService.getPendingApprovals(companyId));
    }

    @PutMapping("/companies/approvals/{userId}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> approveJoinRequest(@PathVariable Long userId) {
        Long companyId = SecurityUtils.getCompanyId();
        String result = companyService.approveJoinRequest(userId, companyId);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PutMapping("/companies/approvals/{userId}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> rejectJoinRequest(@PathVariable Long userId) {
        Long companyId = SecurityUtils.getCompanyId();
        companyService.rejectJoinRequest(userId, companyId);
        return ResponseEntity.ok(Map.of("message", "User rejected."));
    }
}
