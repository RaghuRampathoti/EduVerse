package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.MarkStudentAttendanceRequest;
import com.eduverse.dto.response.AttendanceSummaryResponse;
import com.eduverse.dto.response.FacultyAttendanceResponse;
import com.eduverse.dto.response.FacultyResponse;
import com.eduverse.dto.response.StudentAttendanceResponse;
import com.eduverse.dto.response.StudentResponse;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AttendanceService;
import com.eduverse.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyProfileRepository facultyProfileRepository;
    private final AttendanceService attendanceService;
    private final StudentService studentService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<FacultyResponse>> me(@AuthenticationPrincipal SecurityUser principal) {
        var faculty = facultyProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new com.eduverse.exception.ResourceNotFoundException("Faculty profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(FacultyResponse.from(faculty)));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<Page<StudentResponse>>> classStudents(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam Long classSectionId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                studentService.listByClass(principal.getInstitutionId(), classSectionId, pageable)));
    }

    @PostMapping("/attendance/students")
    public ResponseEntity<ApiResponse<List<StudentAttendanceResponse>>> markStudentAttendance(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody MarkStudentAttendanceRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Attendance saved",
                attendanceService.markStudentAttendance(principal.getInstitutionId(), principal.getUserId(), request)));
    }

    @GetMapping("/attendance/students")
    public ResponseEntity<ApiResponse<Page<StudentAttendanceResponse>>> classAttendance(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam Long classSectionId,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Pageable pageable
    ) {
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            return ResponseEntity.ok(ApiResponse.ok(
                    attendanceService.listStudentAttendanceByClassAndDateRange(
                            principal.getInstitutionId(), classSectionId, start, end, pageable)));
        }
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.listStudentAttendanceByClass(
                        principal.getInstitutionId(), classSectionId, targetDate, pageable)));
    }

    @GetMapping("/attendance/me")
    public ResponseEntity<ApiResponse<List<FacultyAttendanceResponse>>> myAttendance(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        var faculty = facultyProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new com.eduverse.exception.ResourceNotFoundException("Faculty profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getFacultyAttendance(principal.getInstitutionId(), faculty.getId())));
    }

    @GetMapping("/attendance/me/summary")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> myAttendanceSummary(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        var faculty = facultyProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new com.eduverse.exception.ResourceNotFoundException("Faculty profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getFacultyAttendanceSummary(principal.getInstitutionId(), faculty.getId())));
    }
}
