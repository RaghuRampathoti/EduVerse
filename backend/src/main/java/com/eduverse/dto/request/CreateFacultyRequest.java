package com.eduverse.dto.request;

import com.eduverse.entity.Gender;
import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateFacultyRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone number must be a 10-digit number starting with 6, 7, 8, or 9")
        String phone,
        String employeeId,
        String department,
        String designation,
        String qualification,
        Gender gender,
        LocalDate joiningDate,
        LocalDate dateOfBirth,
        String address,
        Double monthlySalary,
        String password,
        InstitutionType institutionType
) {}
