package com.eduverse.dto.request;

import com.eduverse.entity.Gender;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record UpdateStudentRequest(
        String fullName,
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Student mobile number must be a 10-digit number starting with 6, 7, 8, or 9")
        String phone,
        Long classSectionId,
        String rollNumber,
        Gender gender,
        LocalDate dateOfBirth,
        String guardianName,
        String guardianPhone,
        String address,
        @Pattern(regexp = "^$|^(?i)(A|B|AB|O)[+-]$", message = "Blood group must be a valid blood type (A+, A-, B+, B-, O+, O-, AB+, AB-)")
        String bloodGroup,
        String parentFullName,
        String parentEmail,
        String parentUsername,
        String parentPhone,
        String parentPassword
) {}
