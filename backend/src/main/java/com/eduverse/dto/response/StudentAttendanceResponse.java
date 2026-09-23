package com.eduverse.dto.response;

import com.eduverse.entity.AttendanceStatus;
import com.eduverse.entity.StudentAttendance;

import java.time.LocalDate;

public record StudentAttendanceResponse(
        Long id,
        Long studentId,
        String studentName,
        String admissionNumber,
        LocalDate date,
        AttendanceStatus status,
        String remarks
) {
    public static StudentAttendanceResponse from(StudentAttendance a) {
        return new StudentAttendanceResponse(
                a.getId(),
                a.getStudent().getId(),
                a.getStudent().getUser().getFullName(),
                a.getStudent().getAdmissionNumber(),
                a.getAttendanceDate(),
                a.getStatus(),
                a.getRemarks()
        );
    }
}
