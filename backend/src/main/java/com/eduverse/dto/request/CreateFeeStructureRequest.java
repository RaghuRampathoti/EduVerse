package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record CreateFeeStructureRequest(
        Long classSectionId,
        InstitutionType institutionType,
        @NotBlank String title,
        @NotNull @Positive Double amount,
        @NotBlank String academicYear,
        LocalDate dueDate,
        String description
) {}
