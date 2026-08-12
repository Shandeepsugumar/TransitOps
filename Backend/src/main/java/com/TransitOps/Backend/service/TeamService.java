package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.RegisterRequest;
import com.TransitOps.Backend.dto.TeamUserResponse;
import com.TransitOps.Backend.entity.User;
import com.TransitOps.Backend.enums.Role;
import com.TransitOps.Backend.enums.TenantStatus;
import com.TransitOps.Backend.exception.DuplicateResourceException;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TeamService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TeamUserResponse addTeamMember(RegisterRequest request, Long companyId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole());
            if (role == Role.SUPER_ADMIN || role == Role.FLEET_MANAGER) {
                throw new IllegalArgumentException("Cannot create team members with privileged role: " + role);
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .contactNumber(request.getContactNumber())
                .role(role)
                .enabled(true)
                .companyId(companyId)
                .status(TenantStatus.APPROVED) // Auto approved by Fleet Manager
                .build();

        return toResponse(userRepository.save(user));
    }

    public List<TeamUserResponse> getTeamMembers(Long companyId) {
        return userRepository.findByCompanyId(companyId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TeamUserResponse updateTeamMember(Long id, RegisterRequest request, Long companyId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        if (!user.getCompanyId().equals(companyId)) {
            throw new org.springframework.security.access.AccessDeniedException("User does not belong to this company");
        }

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        try {
            Role role = Role.valueOf(request.getRole());
            if (role == Role.SUPER_ADMIN || role == Role.FLEET_MANAGER) {
                throw new IllegalArgumentException("Cannot assign privileged role: " + role);
            }
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setContactNumber(request.getContactNumber());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toResponse(userRepository.save(user));
    }

    private TeamUserResponse toResponse(User u) {
        return TeamUserResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .contactNumber(u.getContactNumber())
                .role(u.getRole().name())
                .status(u.getStatus().name())
                .companyId(u.getCompanyId())
                .build();
    }
}
