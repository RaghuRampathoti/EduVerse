package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a tenant: a School, College or University created by the Master Admin.
 * Every scoped entity in the system (users, students, faculty, attendance, fees...)
 * belongs to exactly one Institution.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "institutions")
public class Institution extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code; // short unique code e.g. "GHS001", used in login / branding

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstitutionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InstitutionStatus status = InstitutionStatus.ACTIVE;

    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;

    private String logoUrl;
    private String primaryColor;

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(name = "max_students")
    @Builder.Default
    private Integer maxStudents = 1000;
}
