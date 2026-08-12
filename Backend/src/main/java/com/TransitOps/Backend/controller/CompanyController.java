package com.TransitOps.Backend.controller;

import com.TransitOps.Backend.dto.CompanyRegistrationRequest;
import com.TransitOps.Backend.dto.CompanyResponse;
import com.TransitOps.Backend.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping("/companies/register")
    public ResponseEntity<String> registerCompany(@Valid @RequestBody CompanyRegistrationRequest request) {
        companyService.registerCompany(request);
        return ResponseEntity.ok("Company registered successfully and is pending approval.");
    }

    @GetMapping("/admin/companies")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<CompanyResponse>> getPendingCompanies(@RequestParam(required = false, defaultValue = "PENDING") String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(companyService.getPendingCompanies());
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/admin/companies/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> approveCompany(@PathVariable Long id) {
        companyService.approveCompany(id);
        return ResponseEntity.ok("Company approved.");
    }

    @PutMapping("/admin/companies/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> rejectCompany(@PathVariable Long id) {
        companyService.rejectCompany(id);
        return ResponseEntity.ok("Company rejected.");
    }
}
