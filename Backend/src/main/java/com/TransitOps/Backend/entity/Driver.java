package com.TransitOps.Backend.entity;

import com.TransitOps.Backend.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optional link to User profile
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private String licenseCategory;

    @Column(nullable = false)
    private LocalDate licenseExpiryDate;

    @Column(nullable = false)
    private String contactNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer safetyScore = 100;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status;
}
