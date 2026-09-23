package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.NotBlank;

public record CreateClassSectionRequest(
        @NotBlank String className,
        String sectionName,
        @NotBlank String academicYear,
        Long classTeacherId,
        InstitutionType institutionType
) {}
