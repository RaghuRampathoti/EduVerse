package com.eduverse.dto.response;

import com.eduverse.entity.AttendanceStatus;
import com.eduverse.entity.FacultyAttendance;

import java.time.LocalDate;

public record FacultyAttendanceResponse(
        Long id,
        Long facultyId,
        String facultyName,
        String employeeId,
        LocalDate date,
        AttendanceStatus status,
        String remarks
) {
    public static FacultyAttendanceResponse from(FacultyAttendance a) {
        return new FacultyAttendanceResponse(
                a.getId(),
                a.getFaculty().getId(),
                a.getFaculty().getUser().getFullName(),
                a.getFaculty().getEmployeeId(),
                a.getAttendanceDate(),
                a.getStatus(),
                a.getRemarks()
        );
    }
}
