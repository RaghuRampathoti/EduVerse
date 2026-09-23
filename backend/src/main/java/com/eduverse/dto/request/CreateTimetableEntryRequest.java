package com.eduverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTimetableEntryRequest(
        @NotNull(message = "Class section ID is required")
        Long classSectionId,

        @NotBlank(message = "Day of week is required")
        String dayOfWeek,

        @NotNull(message = "Period number is required")
        Integer periodNumber,

        String periodName,
        String startTime,
        String endTime,

        @NotBlank(message = "Subject is required")
        String subject,

        Long facultyId,
        String roomNumber
) {}
