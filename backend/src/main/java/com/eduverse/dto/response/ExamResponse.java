package com.eduverse.dto.response;

import com.eduverse.entity.Exam;
import com.eduverse.entity.ExamStatus;
import com.eduverse.entity.ExamType;

import java.time.LocalDate;

public record ExamResponse(
        Long id,
        String title,
        ExamType type,
        LocalDate startDate,
        LocalDate endDate,
        String targetClasses,
        ExamStatus status,
        boolean resultsPublished,
        String createdBy
) {
    public static ExamResponse from(Exam e) {
        return new ExamResponse(
                e.getId(),
                e.getTitle(),
                e.getType(),
                e.getStartDate(),
                e.getEndDate(),
                e.getTargetClasses(),
                e.getStatus(),
                e.isResultsPublished(),
                e.getCreatedBy()
        );
    }
}

