package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.math.BigDecimal;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByCompanyIdAndVehicleId(Long companyId, Long vehicleId);
    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(Long vehicleId);
    List<MaintenanceLog> findByCompanyId(Long companyId);
    Optional<MaintenanceLog> findByIdAndCompanyId(Long id, Long companyId);
}




