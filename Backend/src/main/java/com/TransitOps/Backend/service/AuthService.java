package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.AuthResponse;
import com.TransitOps.Backend.dto.LoginRequest;
import com.TransitOps.Backend.entity.User;
import com.TransitOps.Backend.enums.TenantStatus;
import com.TransitOps.Backend.repository.UserRepository;
import com.TransitOps.Backend.security.JwtUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new BadCredentialsException("Account is disabled");
        }

        if (user.getStatus() == TenantStatus.PENDING) {
            throw new AccessDeniedException("Your join request is pending approval by the company administrator.");
        }
        if (user.getStatus() == TenantStatus.REJECTED) {
            throw new AccessDeniedException("Account registration was rejected");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getCompanyId());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .companyId(user.getCompanyId())
                .build();
    }
}
