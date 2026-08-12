package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.math.BigDecimal;

public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByCompanyIdAndVehicleId(Long companyId, Long vehicleId);
    @Query("SELECT COALESCE(SUM(f.cost), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(Long vehicleId);
    @Query("SELECT COALESCE(SUM(f.liters), 0) FROM FuelLog f WHERE f.vehicle.id = :vehicleId")
    Double sumLitersByVehicleId(Long vehicleId);
    List<FuelLog> findByCompanyId(Long companyId);
    Optional<FuelLog> findByIdAndCompanyId(Long id, Long companyId);
}




