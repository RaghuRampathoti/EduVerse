package com.eduverse.dto.response;

import com.eduverse.entity.Timetable;

public record TimetableEntryResponse(
        Long id,
        Long classSectionId,
        String className,
        String sectionName,
        String dayOfWeek,
        Integer periodNumber,
        String periodName,
        String startTime,
        String endTime,
        String subject,
        Long facultyId,
        String facultyName,
        String roomNumber
) {
    public static TimetableEntryResponse from(Timetable entity) {
        String className = entity.getClassSection() != null ? entity.getClassSection().getClassName() : null;
        String sectionName = entity.getClassSection() != null ? entity.getClassSection().getSectionName() : null;
        Long facultyId = entity.getFaculty() != null ? entity.getFaculty().getId() : null;
        String facultyName = entity.getFaculty() != null && entity.getFaculty().getUser() != null
                ? entity.getFaculty().getUser().getFullName()
                : null;

        return new TimetableEntryResponse(
                entity.getId(),
                entity.getClassSection() != null ? entity.getClassSection().getId() : null,
                className,
                sectionName,
                entity.getDayOfWeek(),
                entity.getPeriodNumber(),
                entity.getPeriodName(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getSubject(),
                facultyId,
                facultyName,
                entity.getRoomNumber()
        );
    }
}
