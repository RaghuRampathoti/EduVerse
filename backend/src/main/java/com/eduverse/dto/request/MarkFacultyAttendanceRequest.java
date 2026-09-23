package com.eduverse.dto.request;

import com.eduverse.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MarkFacultyAttendanceRequest(
        @NotNull Long facultyId,
        @NotNull LocalDate date,
        @NotNull AttendanceStatus status,
        String remarks
) {}
