package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Trip;
import com.TransitOps.Backend.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.math.BigDecimal;

public interface TripRepository extends JpaRepository<Trip, Long> {
    @Query("SELECT t FROM Trip t JOIN FETCH t.vehicle JOIN FETCH t.driver WHERE t.companyId = :companyId AND t.status = :status")
    List<Trip> findByCompanyIdAndStatus(Long companyId, TripStatus status);
    long countByCompanyIdAndStatus(Long companyId, TripStatus status);
    @Query("SELECT COALESCE(SUM(t.revenue), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    BigDecimal sumRevenueByVehicleId(Long vehicleId);
    @Query("SELECT COALESCE(SUM(t.actualDistance), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    Double sumDistanceByVehicleId(Long vehicleId);
    @Query("SELECT COALESCE(SUM(t.fuelConsumed), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    Double sumFuelConsumedByVehicleId(Long vehicleId);
    @Query("SELECT t FROM Trip t JOIN FETCH t.vehicle JOIN FETCH t.driver WHERE t.companyId = :companyId")
    List<Trip> findByCompanyId(Long companyId);
    
    @Query("SELECT t FROM Trip t JOIN FETCH t.vehicle JOIN FETCH t.driver WHERE t.id = :id AND t.companyId = :companyId")
    Optional<Trip> findByIdAndCompanyId(Long id, Long companyId);
}
