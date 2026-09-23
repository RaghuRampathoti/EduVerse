package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.response.AttendanceSummaryResponse;
import com.eduverse.dto.response.FeePaymentResponse;
import com.eduverse.dto.response.StudentAttendanceResponse;
import com.eduverse.dto.response.StudentResponse;
import com.eduverse.entity.StudentProfile;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ParentProfileRepository;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AttendanceService;
import com.eduverse.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentProfileRepository parentProfileRepository;
    private final AttendanceService attendanceService;
    private final FeeService feeService;

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> children(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        var parent = parentProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found"));
        List<StudentResponse> children = parent.getChildren().stream()
                .map(StudentResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(children));
    }

    @GetMapping("/children/{studentId}/attendance")
    public ResponseEntity<ApiResponse<List<StudentAttendanceResponse>>> childAttendance(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long studentId
    ) {
        StudentProfile child = verifyChildAccess(principal, studentId);
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getStudentAttendance(principal.getInstitutionId(), child.getId())));
    }

    @GetMapping("/children/{studentId}/attendance/summary")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> childAttendanceSummary(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long studentId
    ) {
        StudentProfile child = verifyChildAccess(principal, studentId);
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getStudentAttendanceSummary(principal.getInstitutionId(), child.getId())));
    }

    @GetMapping("/children/{studentId}/fees")
    public ResponseEntity<ApiResponse<List<FeePaymentResponse>>> childFees(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long studentId
    ) {
        StudentProfile child = verifyChildAccess(principal, studentId);
        return ResponseEntity.ok(ApiResponse.ok(
                feeService.getStudentFees(principal.getInstitutionId(), child.getId())));
    }

    private StudentProfile verifyChildAccess(SecurityUser principal, Long studentId) {
        var parent = parentProfileRepository.findByUserId(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found"));
        return parent.getChildren().stream()
                .filter(c -> c.getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("This student is not linked to your account"));
    }
}
