package com.eduverse.dto.response;

import java.util.Map;

public record DashboardStatsResponse(
        long totalInstitutions,
        long totalStudents,
        long totalFaculty,
        long totalAdmins,
        long activeInstitutions,
        Map<String, Long> institutionsByType,
        Double totalFeesCollected,
        Double totalFeesPending,
        long presentToday,
        long absentToday
) {}
