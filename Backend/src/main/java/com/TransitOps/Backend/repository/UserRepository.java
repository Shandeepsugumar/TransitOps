package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

import com.TransitOps.Backend.enums.Role;
import com.TransitOps.Backend.enums.TenantStatus;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByCompanyId(Long companyId);
    List<User> findByCompanyIdAndStatus(Long companyId, TenantStatus status);
    boolean existsByCompanyIdAndRoleAndStatus(Long companyId, Role role, TenantStatus status);
    List<User> findByCompanyIdAndRole(Long companyId, Role role);
}

