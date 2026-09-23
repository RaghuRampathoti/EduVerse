package com.eduverse.dto.request;

import com.eduverse.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record MarkStudentAttendanceRequest(
        @NotNull Long classSectionId,
        @NotNull LocalDate date,
        @NotNull List<StudentAttendanceEntry> entries
) {
    public record StudentAttendanceEntry(
            @NotNull Long studentId,
            @NotNull AttendanceStatus status,
            String remarks
    ) {}
}
