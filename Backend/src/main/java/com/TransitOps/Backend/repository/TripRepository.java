package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Trip;
import com.TransitOps.Backend.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.math.BigDecimal;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByStatus(TripStatus status);
    long countByStatus(TripStatus status);
    @Query("SELECT COALESCE(SUM(t.revenue), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    BigDecimal sumRevenueByVehicleId(Long vehicleId);
    @Query("SELECT COALESCE(SUM(t.actualDistance), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    Double sumDistanceByVehicleId(Long vehicleId);
    @Query("SELECT COALESCE(SUM(t.fuelConsumed), 0) FROM Trip t WHERE t.vehicle.id = :vehicleId AND t.status = 'COMPLETED'")
    Double sumFuelConsumedByVehicleId(Long vehicleId);
}
