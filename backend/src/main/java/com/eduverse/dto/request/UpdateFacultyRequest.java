package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Pattern;

public record UpdateFacultyRequest(
        String fullName,
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a 10-digit number starting with 6, 7, 8, or 9")
        String phone,
        String department,
        String designation,
        String qualification,
        String address,
        Double monthlySalary,
        InstitutionType institutionType,
        String password,
        String employeeId
) {}
