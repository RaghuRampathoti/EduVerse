package com.eduverse.dto.request;

import com.eduverse.entity.Gender;
import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateFacultyRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
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
