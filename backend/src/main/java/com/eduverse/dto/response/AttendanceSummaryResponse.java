package com.eduverse.dto.response;

public record AttendanceSummaryResponse(
        long totalDays,
        long present,
        long absent,
        long late,
        long onLeave,
        double percentagePresent
) {}
