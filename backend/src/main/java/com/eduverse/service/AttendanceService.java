package com.eduverse.service;

import com.eduverse.dto.request.MarkFacultyAttendanceRequest;
import com.eduverse.dto.request.MarkStudentAttendanceRequest;
import com.eduverse.dto.response.AttendanceSummaryResponse;
import com.eduverse.dto.response.FacultyAttendanceResponse;
import com.eduverse.dto.response.StudentAttendanceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    List<StudentAttendanceResponse> markStudentAttendance(Long institutionId, Long userId,
                                                           MarkStudentAttendanceRequest request);
    List<StudentAttendanceResponse> getStudentAttendance(Long institutionId, Long studentId);
    AttendanceSummaryResponse getStudentAttendanceSummary(Long institutionId, Long studentId);

    FacultyAttendanceResponse markFacultyAttendance(Long institutionId, Long userId,
                                                     MarkFacultyAttendanceRequest request);
    List<FacultyAttendanceResponse> getFacultyAttendance(Long institutionId, Long facultyId);
    AttendanceSummaryResponse getFacultyAttendanceSummary(Long institutionId, Long facultyId);

    Page<StudentAttendanceResponse> listStudentAttendanceByClass(Long institutionId, Long classSectionId,
                                                                  LocalDate date, Pageable pageable);
    Page<StudentAttendanceResponse> listStudentAttendanceByClassAndDateRange(Long institutionId, Long classSectionId,
                                                                          LocalDate startDate, LocalDate endDate, Pageable pageable);
    Page<FacultyAttendanceResponse> listInstitutionAttendance(Long institutionId, LocalDate date, Pageable pageable);
}
