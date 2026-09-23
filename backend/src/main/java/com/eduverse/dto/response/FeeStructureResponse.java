package com.eduverse.dto.response;

import com.eduverse.entity.FeeStructure;
import com.eduverse.entity.InstitutionType;

import java.time.LocalDate;

public record FeeStructureResponse(
        Long id,
        Long classSectionId,
        String className,
        InstitutionType institutionType,
        String institutionName,
        String title,
        Double amount,
        String academicYear,
        LocalDate dueDate,
        String description
) {
    public static FeeStructureResponse from(FeeStructure f) {
        InstitutionType type = f.getInstitutionType() != null ? f.getInstitutionType() :
                (f.getClassSection() != null && f.getClassSection().getInstitutionType() != null ? f.getClassSection().getInstitutionType() :
                        (f.getInstitution() != null ? f.getInstitution().getType() : InstitutionType.SCHOOL));

        return new FeeStructureResponse(
                f.getId(),
                f.getClassSection() != null ? f.getClassSection().getId() : null,
                f.getClassSection() != null ? (f.getClassSection().getClassName() + " " + (f.getClassSection().getSectionName() != null ? f.getClassSection().getSectionName() : "")) : "All Classes",
                type,
                f.getInstitution() != null ? f.getInstitution().getName() : null,
                f.getTitle(),
                f.getAmount(),
                f.getAcademicYear(),
                f.getDueDate(),
                f.getDescription()
        );
    }
}
