package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.CompanyRegistrationRequest;
import com.TransitOps.Backend.dto.CompanyResponse;
import com.TransitOps.Backend.entity.Company;
import com.TransitOps.Backend.entity.User;
import com.TransitOps.Backend.enums.Role;
import com.TransitOps.Backend.enums.TenantStatus;
import com.TransitOps.Backend.exception.DuplicateResourceException;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.CompanyRepository;
import com.TransitOps.Backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void registerCompany(CompanyRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getAdminEmail());
        }

        Company company = Company.builder()
                .name(request.getCompanyName())
                .registrationDetails(request.getRegistrationDetails())
                .status(TenantStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        Company savedCompany = companyRepository.save(company);

        User admin = User.builder()
                .fullName(request.getAdminFullName())
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(request.getAdminPassword()))
                .role(Role.FLEET_MANAGER)
                .enabled(true)
                .companyId(savedCompany.getId())
                .status(TenantStatus.PENDING)
                .build();
        userRepository.save(admin);
    }

    public List<CompanyResponse> getPendingCompanies() {
        return companyRepository.findByStatus(TenantStatus.PENDING)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void approveCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
        company.setStatus(TenantStatus.APPROVED);
        companyRepository.save(company);

        List<User> users = userRepository.findByCompanyId(id);
        if (users != null) {
            for (User u : users) {
                u.setStatus(TenantStatus.APPROVED);
                userRepository.save(u);
            }
        }
    }

    @Transactional
    public void rejectCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id " + id));
        company.setStatus(TenantStatus.REJECTED);
        companyRepository.save(company);

        List<User> users = userRepository.findByCompanyId(id);
        if (users != null) {
            for (User u : users) {
                u.setStatus(TenantStatus.REJECTED);
                userRepository.save(u);
            }
        }
    }

    private CompanyResponse toResponse(Company c) {
        return CompanyResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .registrationDetails(c.getRegistrationDetails())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .build();
    }
}

