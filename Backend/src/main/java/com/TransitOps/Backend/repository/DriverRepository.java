package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Driver;
import com.TransitOps.Backend.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByLicenseNumber(String licenseNumber);
    List<Driver> findByStatus(DriverStatus status);
    @Query("SELECT d FROM Driver d WHERE d.status = 'AVAILABLE' AND d.licenseExpiryDate > :today")
    List<Driver> findAvailableDrivers(LocalDate today);
    long countByStatus(DriverStatus status);
}
