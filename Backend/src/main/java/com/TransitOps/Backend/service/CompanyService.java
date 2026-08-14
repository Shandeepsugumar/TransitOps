package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.*;
import com.TransitOps.Backend.entity.Company;
import com.TransitOps.Backend.entity.User;
import com.TransitOps.Backend.enums.Role;
import com.TransitOps.Backend.enums.TenantStatus;
import com.TransitOps.Backend.exception.*;
import com.TransitOps.Backend.repository.CompanyRepository;
import com.TransitOps.Backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final Set<String> JOINABLE_ROLES = Set.of(
        "FLEET_MANAGER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"
    );

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public void registerCompany(CompanyRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getAdminEmail());
        }

        Company company = Company.builder()
                .name(request.getCompanyName())
                .registrationDetails(request.getRegistrationDetails())
                .status(TenantStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        Company savedCompany = companyRepository.save(company);

        User admin = User.builder()
                .fullName(request.getAdminFullName())
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(request.getAdminPassword()))
                .role(Role.SUPER_ADMIN)
                .enabled(true)
                .companyId(savedCompany.getId())
                .status(TenantStatus.ACTIVE)
                .build();
        userRepository.save(admin);
    }

    @Transactional
    public void joinCompany(JoinCompanyRequest request) {
        // Validate role
        if (!JOINABLE_ROLES.contains(request.getRole())) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole() + ". SUPER_ADMIN cannot be self-assigned.");
        }

        // Validate company exists and is active
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + request.getCompanyId()));
        if (company.getStatus() != TenantStatus.ACTIVE) {
            throw new BusinessRuleException("Company is not active");
        }

        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Role role = Role.valueOf(request.getRole());

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .contactNumber(request.getContactNumber())
                .role(role)
                .enabled(true)
                .companyId(company.getId())
                .status(TenantStatus.PENDING)
                .build();
        userRepository.save(user);

        // Notify company SUPER_ADMIN(s)
        List<User> admins = userRepository.findByCompanyIdAndRole(company.getId(), Role.SUPER_ADMIN);
        for (User admin : admins) {
            emailService.sendJoinRequestNotification(admin.getEmail(), request.getFullName(), request.getRole(), company.getName());
        }
    }

    public List<CompanyResponse> searchCompanies(String query) {
        List<Company> companies;
        if (query == null || query.isBlank()) {
            companies = companyRepository.findByStatus(TenantStatus.ACTIVE);
        } else {
            companies = companyRepository.findByNameContainingIgnoreCaseAndStatus(query, TenantStatus.ACTIVE);
        }
        return companies.stream().map(this::toCompanyResponse).collect(Collectors.toList());
    }

    public List<PendingApprovalResponse> getPendingApprovals(Long companyId) {
        return userRepository.findByCompanyIdAndStatus(companyId, TenantStatus.PENDING)
                .stream().map(this::toPendingResponse).collect(Collectors.toList());
    }

    @Transactional
    public String approveJoinRequest(Long userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        if (!user.getCompanyId().equals(companyId)) {
            throw new org.springframework.security.access.AccessDeniedException("User does not belong to your company");
        }
        if (user.getStatus() != TenantStatus.PENDING) {
            throw new BusinessRuleException("User is not in PENDING status");
        }

        // FLEET_MANAGER uniqueness check
        String warning = null;
        if (user.getRole() == Role.FLEET_MANAGER) {
            boolean exists = userRepository.existsByCompanyIdAndRoleAndStatus(companyId, Role.FLEET_MANAGER, TenantStatus.ACTIVE);
            if (exists) {
                warning = "Warning: This company already has an active Fleet Manager. A second Fleet Manager has been approved.";
            }
        }

        user.setStatus(TenantStatus.ACTIVE);
        userRepository.save(user);

        // Notify the applicant
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        emailService.sendApprovalNotification(user.getEmail(), user.getFullName(), company.getName());

        return warning != null ? warning : "User approved successfully.";
    }

    @Transactional
    public void rejectJoinRequest(Long userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        if (!user.getCompanyId().equals(companyId)) {
            throw new org.springframework.security.access.AccessDeniedException("User does not belong to your company");
        }
        if (user.getStatus() != TenantStatus.PENDING) {
            throw new BusinessRuleException("User is not in PENDING status");
        }

        user.setStatus(TenantStatus.REJECTED);
        userRepository.save(user);

        // Notify the applicant
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        emailService.sendRejectionNotification(user.getEmail(), user.getFullName(), company.getName());
    }

    private CompanyResponse toCompanyResponse(Company c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .registrationDetails(c.getRegistrationDetails())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private PendingApprovalResponse toPendingResponse(User u) {
        return PendingApprovalResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .contactNumber(u.getContactNumber())
                .role(u.getRole().name())
                .status(u.getStatus().name())
                .build();
    }
}
