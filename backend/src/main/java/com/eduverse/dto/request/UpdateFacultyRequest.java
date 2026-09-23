package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionType;

public record UpdateFacultyRequest(
        String fullName,
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
