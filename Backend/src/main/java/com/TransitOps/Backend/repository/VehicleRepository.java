package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Vehicle;
import com.TransitOps.Backend.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByRegistrationNumber(String registrationNumber);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    List<Vehicle> findByStatusNotIn(List<VehicleStatus> statuses);
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByType(String type);
    List<Vehicle> findByRegion(String region);
    long countByStatus(VehicleStatus status);
}
