package com.eduverse.dto.response;

import com.eduverse.entity.Homework;
import com.eduverse.entity.HomeworkStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record HomeworkResponse(
        Long id,
        String title,
        String subject,
        String classSection,
        String assignedFaculty,
        LocalDate dueDate,
        String description,
        HomeworkStatus status,
        int submissionsCount,
        LocalDateTime createdAt
) {
    public static HomeworkResponse from(Homework h) {
        return new HomeworkResponse(
                h.getId(),
                h.getTitle(),
                h.getSubject(),
                h.getClassSection(),
                h.getAssignedFaculty(),
                h.getDueDate(),
                h.getDescription(),
                h.getStatus(),
                h.getSubmissionsCount(),
                h.getCreatedAt()
        );
    }
}

