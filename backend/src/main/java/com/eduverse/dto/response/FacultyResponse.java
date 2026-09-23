package com.eduverse.dto.response;

import com.eduverse.entity.FacultyProfile;
import com.eduverse.entity.Gender;
import com.eduverse.entity.UserStatus;

import java.time.LocalDate;

public record FacultyResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String phone,
        UserStatus status,
        String employeeId,
        String department,
        String designation,
        String qualification,
        Gender gender,
        LocalDate joiningDate,
        LocalDate dateOfBirth,
        String address,
        Double monthlySalary,
        String avatarUrl,
        String temporaryPassword,
        String institutionType,
        String institutionName
) {
    public static FacultyResponse from(FacultyProfile f) {
        return from(f, null);
    }

    public static FacultyResponse from(FacultyProfile f, String temporaryPassword) {
        String type = "SCHOOL";
        String name = "";
        if (f.getInstitutionType() != null) {
            type = f.getInstitutionType().name();
        } else if (f.getInstitution() != null && f.getInstitution().getType() != null) {
            type = f.getInstitution().getType().name();
        } else if (f.getUser() != null && f.getUser().getInstitution() != null && f.getUser().getInstitution().getType() != null) {
            type = f.getUser().getInstitution().getType().name();
        }

        if (f.getInstitution() != null) {
            name = f.getInstitution().getName() != null ? f.getInstitution().getName() : "";
        } else if (f.getUser() != null && f.getUser().getInstitution() != null) {
            name = f.getUser().getInstitution().getName() != null ? f.getUser().getInstitution().getName() : "";
        }

        return new FacultyResponse(
                f.getId(),
                f.getUser().getId(),
                f.getUser().getFullName(),
                f.getUser().getEmail(),
                f.getUser().getPhone(),
                f.getUser().getStatus(),
                f.getEmployeeId(),
                f.getDepartment(),
                f.getDesignation(),
                f.getQualification(),
                f.getGender(),
                f.getJoiningDate(),
                f.getDateOfBirth(),
                f.getAddress(),
                f.getMonthlySalary(),
                f.getUser().getAvatarUrl(),
                temporaryPassword,
                type,
                name
        );
    }
}
