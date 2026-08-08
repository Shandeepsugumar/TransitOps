package com.TransitOps.Backend.service;

import com.TransitOps.Backend.dto.DriverRequest;
import com.TransitOps.Backend.dto.DriverResponse;
import com.TransitOps.Backend.entity.Driver;
import com.TransitOps.Backend.entity.User;
import com.TransitOps.Backend.enums.DriverStatus;
import com.TransitOps.Backend.exception.DuplicateResourceException;
import com.TransitOps.Backend.exception.ResourceNotFoundException;
import com.TransitOps.Backend.repository.DriverRepository;
import com.TransitOps.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    public DriverService(DriverRepository driverRepository, UserRepository userRepository) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
    }

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DriverResponse> getAvailableDrivers() {
        return driverRepository.findAvailableDrivers(LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DriverResponse getDriverById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver with license " + request.getLicenseNumber() + " already exists");
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));
        }

        Driver driver = Driver.builder()
                .user(user)
                .name(request.getName())
                .licenseNumber(request.getLicenseNumber())
                .licenseCategory(request.getLicenseCategory())
                .licenseExpiryDate(LocalDate.parse(request.getLicenseExpiryDate()))
                .contactNumber(request.getContactNumber())
                .safetyScore(request.getSafetyScore())
                .status(DriverStatus.valueOf(request.getStatus()))
                .build();

        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = findById(id);

        if (!driver.getLicenseNumber().equals(request.getLicenseNumber())
                && driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("Driver with license " + request.getLicenseNumber() + " already exists");
        }

        driver.setName(request.getName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseCategory(request.getLicenseCategory());
        driver.setLicenseExpiryDate(LocalDate.parse(request.getLicenseExpiryDate()));
        driver.setContactNumber(request.getContactNumber());
        driver.setSafetyScore(request.getSafetyScore());
        driver.setStatus(DriverStatus.valueOf(request.getStatus()));

        return toResponse(driverRepository.save(driver));
    }

    public Driver findById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    private DriverResponse toResponse(Driver d) {
        return DriverResponse.builder()
                .id(d.getId())
                .userId(d.getUser() != null ? d.getUser().getId() : null)
                .name(d.getName())
                .licenseNumber(d.getLicenseNumber())
                .licenseCategory(d.getLicenseCategory())
                .licenseExpiryDate(d.getLicenseExpiryDate().toString())
                .contactNumber(d.getContactNumber())
                .safetyScore(d.getSafetyScore())
                .status(d.getStatus().name())
                .build();
    }
}
