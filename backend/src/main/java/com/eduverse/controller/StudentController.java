package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.response.AttendanceSummaryResponse;
import com.eduverse.dto.response.FeePaymentResponse;
import com.eduverse.dto.response.StudentAttendanceResponse;
import com.eduverse.dto.response.StudentResponse;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AttendanceService;
import com.eduverse.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentProfileRepository studentProfileRepository;
    private final AttendanceService attendanceService;
    private final FeeService feeService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentResponse>> me(@AuthenticationPrincipal SecurityUser principal) {
        var student = studentProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(StudentResponse.from(student)));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<StudentAttendanceResponse>>> myAttendance(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        var student = studentProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getStudentAttendance(principal.getInstitutionId(), student.getId())));
    }

    @GetMapping("/attendance/summary")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> myAttendanceSummary(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        var student = studentProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getStudentAttendanceSummary(principal.getInstitutionId(), student.getId())));
    }

    @GetMapping("/fees")
    public ResponseEntity<ApiResponse<List<FeePaymentResponse>>> myFees(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        var student = studentProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return ResponseEntity.ok(ApiResponse.ok(
                feeService.getStudentFees(principal.getInstitutionId(), student.getId())));
    }
}
