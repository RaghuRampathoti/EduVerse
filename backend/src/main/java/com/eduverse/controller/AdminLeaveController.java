package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.entity.*;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.LeaveApplicationRepository;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/leaves")
@RequiredArgsConstructor
public class AdminLeaveController {

    private final LeaveApplicationRepository leaveRepo;
    private final InstitutionRepository institutionRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveApplication>>> list(@AuthenticationPrincipal SecurityUser p) {
        return ResponseEntity.ok(ApiResponse.ok(
                leaveRepo.findByInstitutionIdOrderByCreatedAtDesc(p.getInstitutionId())));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveApplication>>> pending(@AuthenticationPrincipal SecurityUser p) {
        return ResponseEntity.ok(ApiResponse.ok(
                leaveRepo.findByInstitutionIdAndStatus(p.getInstitutionId(), LeaveStatus.PENDING)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveApplication>> apply(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        Institution inst = institutionRepository.getReferenceById(p.getInstitutionId());
        LocalDate from = parseDate(body.get("fromDate"));
        LocalDate to = parseDate(body.get("toDate"));
        int days = (from != null && to != null) ? (int) ChronoUnit.DAYS.between(from, to) + 1 : 1;
        Role role;
        try { role = Role.valueOf(String.valueOf(body.getOrDefault("role", "STUDENT"))); }
        catch (Exception e) { role = Role.STUDENT; }

        LeaveApplication leave = LeaveApplication.builder()
                .institution(inst)
                .applicantName(String.valueOf(body.getOrDefault("applicantName", "Unknown")))
                .applicantRole(role)
                .leaveType(String.valueOf(body.getOrDefault("leaveType", "CASUAL")))
                .fromDate(from).toDate(to).daysCount(days)
                .reason(String.valueOf(body.getOrDefault("reason", "")))
                .status(LeaveStatus.PENDING)
                .build();
        leave = leaveRepo.save(leave);
        auditLogService.log(p.getInstitutionId(), "APPLY_LEAVE", "LEAVE", leave.getId(),
                leave.getApplicantName() + " applied " + days + " day(s) " + leave.getLeaveType() + " leave");
        return ResponseEntity.ok(ApiResponse.ok("Leave applied", leave));
    }

    @PutMapping("/{id}/decision")
    public ResponseEntity<ApiResponse<LeaveApplication>> decide(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        LeaveApplication leave = leaveRepo.findByIdAndInstitutionId(id, p.getInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));
        String decision = String.valueOf(body.getOrDefault("status", "")).toUpperCase();
        if (!decision.equals("APPROVED") && !decision.equals("REJECTED")) {
            throw new BadRequestException("Status must be APPROVED or REJECTED");
        }
        leave.setStatus(LeaveStatus.valueOf(decision));
        leave.setReviewedBy(p.getUser().getFullName());
        leave = leaveRepo.save(leave);
        auditLogService.log(p.getInstitutionId(), decision + "_LEAVE", "LEAVE", leave.getId(),
                p.getUser().getFullName() + " " + decision.toLowerCase() + " leave for " + leave.getApplicantName());
        return ResponseEntity.ok(ApiResponse.ok("Leave " + decision.toLowerCase(), leave));
    }

    private LocalDate parseDate(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return LocalDate.parse(String.valueOf(o)); } catch (Exception e) { return null; }
    }
}
