package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.math.BigDecimal;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    @Query("SELECT m FROM MaintenanceLog m JOIN FETCH m.vehicle WHERE m.companyId = :companyId AND m.vehicle.id = :vehicleId")
    List<MaintenanceLog> findByCompanyIdAndVehicleId(Long companyId, Long vehicleId);
    
    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.vehicle.id = :vehicleId")
    BigDecimal sumCostByVehicleId(Long vehicleId);
    
    @Query("SELECT m FROM MaintenanceLog m JOIN FETCH m.vehicle WHERE m.companyId = :companyId")
    List<MaintenanceLog> findByCompanyId(Long companyId);
    
    @Query("SELECT m FROM MaintenanceLog m JOIN FETCH m.vehicle WHERE m.id = :id AND m.companyId = :companyId")
    Optional<MaintenanceLog> findByIdAndCompanyId(Long id, Long companyId);
}
