package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.MarkFacultyAttendanceRequest;
import com.eduverse.dto.response.FacultyAttendanceResponse;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AttendanceService;
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

/**
 * Admin/Super Admin endpoints for marking and reviewing FACULTY attendance
 * (as opposed to /api/faculty/attendance/students, which is faculty marking students).
 */
@RestController
@RequestMapping("/api/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/faculty")
    public ResponseEntity<ApiResponse<FacultyAttendanceResponse>> markFacultyAttendance(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody MarkFacultyAttendanceRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Attendance saved",
                attendanceService.markFacultyAttendance(principal.getInstitutionId(), principal.getUserId(), request)));
    }

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<Page<FacultyAttendanceResponse>>> listFacultyAttendance(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam(required = false) String date,
            Pageable pageable
    ) {
        LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.listInstitutionAttendance(principal.getInstitutionId(), targetDate, pageable)));
    }
}
