package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Company;
import com.TransitOps.Backend.enums.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByStatus(TenantStatus status);
}
