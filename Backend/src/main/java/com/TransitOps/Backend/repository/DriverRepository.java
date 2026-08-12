package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Driver;
import com.TransitOps.Backend.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByLicenseNumberAndCompanyId(String licenseNumber, Long companyId);
    List<Driver> findByCompanyIdAndStatus(Long companyId, DriverStatus status);
    @Query("SELECT d FROM Driver d WHERE d.companyId = :companyId AND d.status = 'AVAILABLE' AND d.licenseExpiryDate > :today")
    List<Driver> findAvailableDrivers(Long companyId, LocalDate today);
    long countByCompanyIdAndStatus(Long companyId, DriverStatus status);
    List<Driver> findByCompanyId(Long companyId);
    Optional<Driver> findByIdAndCompanyId(Long id, Long companyId);
}





