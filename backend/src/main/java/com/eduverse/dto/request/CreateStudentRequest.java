package com.eduverse.dto.request;

import com.eduverse.entity.Gender;
import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateStudentRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        String username,
        String password,
        @NotBlank(message = "Student mobile number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Student mobile number must be a 10-digit number starting with 6, 7, 8, or 9")
        String phone,
        @NotBlank(message = "Admission number is required")
        @Pattern(regexp = "^[0-9]+$", message = "Admission number must be a whole number without decimal values")
        String admissionNumber,
        Long classSectionId,
        String rollNumber,
        Gender gender,
        InstitutionType institutionType,
        LocalDate dateOfBirth,
        LocalDate admissionDate,
        String guardianName,
        String guardianPhone,
        String address,
        @Pattern(regexp = "^$|^(?i)(A|B|AB|O)[+-]$", message = "Blood group must be a valid blood type (A+, A-, B+, B-, O+, O-, AB+, AB-)")
        String bloodGroup,

        // Optionally link/create a parent account in the same request
        String parentFullName,
        @Email String parentEmail,
        String parentUsername,
        String parentPassword,
        String parentPhone
) {}
