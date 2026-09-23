package com.eduverse.dto.request;

import com.eduverse.entity.Gender;
import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateStudentRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        String username,
        String password,
        String phone,
        @NotBlank String admissionNumber,
        Long classSectionId,
        String rollNumber,
        Gender gender,
        InstitutionType institutionType,
        LocalDate dateOfBirth,
        LocalDate admissionDate,
        String guardianName,
        String guardianPhone,
        String address,
        String bloodGroup,

        // Optionally link/create a parent account in the same request
        String parentFullName,
        @Email String parentEmail,
        String parentUsername,
        String parentPassword,
        String parentPhone
) {}
