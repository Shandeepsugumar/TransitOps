package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.*;
import com.TransitOps.Backend.entity.*;
import com.TransitOps.Backend.enums.ExpenseType;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FinancialService {

    private final FuelLogRepository fuelLogRepository;
    private final ExpenseRepository expenseRepository;
    private final VehicleService vehicleService;

    public FinancialService(FuelLogRepository fuelLogRepository, ExpenseRepository expenseRepository, VehicleService vehicleService) {
        this.fuelLogRepository = fuelLogRepository;
        this.expenseRepository = expenseRepository;
        this.vehicleService = vehicleService;
    }

    // --- Fuel Logs ---
    public List<FuelLogResponse> getFuelLogs(Long vehicleId) {
        List<FuelLog> logs = vehicleId != null
                ? fuelLogRepository.findByVehicleId(vehicleId)
                : fuelLogRepository.findAll();
        return logs.stream().map(this::toFuelResponse).collect(Collectors.toList());
    }

    @Transactional
    public FuelLogResponse createFuelLog(FuelLogRequest request) {
        Vehicle vehicle = vehicleService.findById(request.getVehicleId());

        FuelLog log = FuelLog.builder()
                .vehicle(vehicle)
                .liters(request.getLiters())
                .cost(request.getCost())
                .date(LocalDate.parse(request.getDate()))
                .build();

        return toFuelResponse(fuelLogRepository.save(log));
    }

    // --- Expenses ---
    public List<ExpenseResponse> getExpenses(Long vehicleId) {
        List<Expense> expenses = vehicleId != null
                ? expenseRepository.findByVehicleId(vehicleId)
                : expenseRepository.findAll();
        return expenses.stream().map(this::toExpenseResponse).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        Vehicle vehicle = vehicleService.findById(request.getVehicleId());

        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .type(ExpenseType.valueOf(request.getType()))
                .amount(request.getAmount())
                .date(LocalDate.parse(request.getDate()))
                .notes(request.getNotes())
                .build();

        return toExpenseResponse(expenseRepository.save(expense));
    }

    private FuelLogResponse toFuelResponse(FuelLog f) {
        return FuelLogResponse.builder()
                .id(f.getId())
                .vehicleId(f.getVehicle().getId())
                .vehicleRegistration(f.getVehicle().getRegistrationNumber())
                .liters(f.getLiters())
                .cost(f.getCost())
                .date(f.getDate().toString())
                .build();
    }

    private ExpenseResponse toExpenseResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .vehicleId(e.getVehicle().getId())
                .vehicleRegistration(e.getVehicle().getRegistrationNumber())
                .type(e.getType().name())
                .amount(e.getAmount())
                .date(e.getDate().toString())
                .notes(e.getNotes())
                .build();
    }
}
