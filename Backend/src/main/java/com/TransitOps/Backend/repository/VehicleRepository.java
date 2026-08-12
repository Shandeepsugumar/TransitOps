package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Vehicle;
import com.TransitOps.Backend.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByRegistrationNumberAndCompanyId(String registrationNumber, Long companyId);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    List<Vehicle> findByCompanyIdAndStatusNotIn(Long companyId, List<VehicleStatus> statuses);
    List<Vehicle> findByCompanyIdAndStatus(Long companyId, VehicleStatus status);
    List<Vehicle> findByCompanyIdAndType(Long companyId, String type);
    List<Vehicle> findByCompanyIdAndRegion(Long companyId, String region);
    long countByCompanyIdAndStatus(Long companyId, VehicleStatus status);
    List<Vehicle> findByCompanyId(Long companyId);
    Optional<Vehicle> findByIdAndCompanyId(Long id, Long companyId);
}





