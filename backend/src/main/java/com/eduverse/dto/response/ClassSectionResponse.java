package com.eduverse.dto.response;

import com.eduverse.entity.ClassSection;

public record ClassSectionResponse(
        Long id,
        String className,
        String sectionName,
        String academicYear,
        Long classTeacherId,
        String classTeacherName,
        long studentCount,
        String institutionType,
        String institutionName
) {
    public static ClassSectionResponse from(ClassSection c, long studentCount) {
        String type = c.getInstitutionType() != null
                ? c.getInstitutionType().name()
                : (c.getInstitution() != null && c.getInstitution().getType() != null
                        ? c.getInstitution().getType().name()
                        : "COLLEGE");
        String name = c.getInstitution() != null && c.getInstitution().getName() != null
                ? c.getInstitution().getName()
                : "";

        return new ClassSectionResponse(
                c.getId(), c.getClassName(), c.getSectionName(), c.getAcademicYear(),
                c.getClassTeacher() != null ? c.getClassTeacher().getId() : null,
                c.getClassTeacher() != null ? c.getClassTeacher().getUser().getFullName() : null,
                studentCount,
                type,
                name
        );
    }
}
