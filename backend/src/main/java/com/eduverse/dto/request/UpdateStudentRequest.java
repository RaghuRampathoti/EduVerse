package com.eduverse.dto.request;

import com.eduverse.entity.Gender;

import java.time.LocalDate;

public record UpdateStudentRequest(
        String fullName,
        String phone,
        Long classSectionId,
        String rollNumber,
        Gender gender,
        LocalDate dateOfBirth,
        String guardianName,
        String guardianPhone,
        String address,
        String bloodGroup,
        String parentFullName,
        String parentEmail,
        String parentUsername,
        String parentPhone,
        String parentPassword
) {}
