package com.eduverse.dto.response;

import com.eduverse.entity.Gender;
import com.eduverse.entity.InstitutionType;
import com.eduverse.entity.StudentProfile;
import com.eduverse.entity.UserStatus;

import java.time.LocalDate;

public record StudentResponse(
        Long id,
        Long userId,
        String fullName,
        String email,
        String username,
        String phone,
        UserStatus status,
        String admissionNumber,
        Long classSectionId,
        String className,
        String sectionName,
        String rollNumber,
        Gender gender,
        InstitutionType institutionType,
        String institutionName,
        LocalDate dateOfBirth,
        LocalDate admissionDate,
        String guardianName,
        String guardianPhone,
        String address,
        String bloodGroup,
        String avatarUrl,
        String tempPassword,
        String parentFullName,
        String parentEmail,
        String parentUsername,
        String parentPhone,
        String parentTempPassword
) {
    public static StudentResponse from(StudentProfile s) {
        return from(s, null, null, null, null, null, null);
    }

    public static StudentResponse from(StudentProfile s, String tempPassword, String parentEmail, String parentUsername, String parentTempPassword) {
        return from(s, tempPassword, parentEmail, parentUsername, parentTempPassword, null, null);
    }

    public static StudentResponse from(StudentProfile s, String tempPassword, String parentEmail, String parentUsername, String parentTempPassword, String parentFullName, String parentPhone) {
        InstitutionType type = s.getInstitutionType() != null ? s.getInstitutionType() :
                (s.getClassSection() != null && s.getClassSection().getInstitutionType() != null ? s.getClassSection().getInstitutionType() :
                        (s.getInstitution() != null ? s.getInstitution().getType() : InstitutionType.SCHOOL));

        return new StudentResponse(
                s.getId(),
                s.getUser().getId(),
                s.getUser().getFullName(),
                s.getUser().getEmail(),
                s.getUser().getUsername(),
                s.getUser().getPhone(),
                s.getUser().getStatus(),
                s.getAdmissionNumber(),
                s.getClassSection() != null ? s.getClassSection().getId() : null,
                s.getClassSection() != null ? s.getClassSection().getClassName() : null,
                s.getClassSection() != null ? s.getClassSection().getSectionName() : null,
                s.getRollNumber(),
                s.getGender(),
                type,
                s.getInstitution() != null ? s.getInstitution().getName() : null,
                s.getDateOfBirth(),
                s.getAdmissionDate(),
                s.getGuardianName(),
                s.getGuardianPhone(),
                s.getAddress(),
                s.getBloodGroup(),
                s.getUser().getAvatarUrl(),
                tempPassword,
                parentFullName,
                parentEmail,
                parentUsername,
                parentPhone,
                parentTempPassword
        );
    }
}
