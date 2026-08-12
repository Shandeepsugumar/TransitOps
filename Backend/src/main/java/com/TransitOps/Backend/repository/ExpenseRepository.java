package com.TransitOps.Backend.repository;

import com.TransitOps.Backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.math.BigDecimal;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByCompanyIdAndVehicleId(Long companyId, Long vehicleId);
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.vehicle.id = :vehicleId")
    BigDecimal sumAmountByVehicleId(Long vehicleId);
    List<Expense> findByCompanyId(Long companyId);
    Optional<Expense> findByIdAndCompanyId(Long id, Long companyId);
}




