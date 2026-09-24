package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Submitted by the Master Admin. Creates an Institution AND its first
 * SUPER_ADMIN user account in one step.
 */
public record CreateInstitutionRequest(
        @NotBlank String name,
        @NotBlank String code,
        InstitutionType type,
        String phone,
        String address,
        String city,
        String state,
        String country,
        String postalCode,
        Integer establishedYear,
        Integer maxStudents,

        // Super admin account for this institution
        @NotBlank String superAdminFullName,
        @NotBlank @Email String superAdminEmail,
        String superAdminUsername,
        String superAdminPhone,
        String superAdminPassword
) {}
