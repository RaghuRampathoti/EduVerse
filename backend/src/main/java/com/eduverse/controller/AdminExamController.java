package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.response.ExamResponse;
import com.eduverse.entity.*;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ExamRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/exams")
@RequiredArgsConstructor
public class AdminExamController {

    private final ExamRepository examRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResponse>>> list(@AuthenticationPrincipal SecurityUser p) {
        List<ExamResponse> list = examRepository.findByInstitutionIdOrderByStartDateDesc(p.getInstitutionId())
                .stream()
                .map(ExamResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExamResponse>> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        Institution inst = institutionRepository.findById(p.getInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
        ExamType type;
        try { type = ExamType.valueOf(String.valueOf(body.getOrDefault("type", "MIDTERM"))); }
        catch (Exception e) { type = ExamType.MIDTERM; }

        String creator = (p.getUser() != null && p.getUser().getFullName() != null)
                ? p.getUser().getFullName()
                : "School Administrator";

        Exam exam = Exam.builder()
                .institution(inst)
                .title(String.valueOf(body.getOrDefault("title", "Untitled Exam")))
                .type(type)
                .startDate(parseDate(body.get("startDate")))
                .endDate(parseDate(body.get("endDate")))
                .targetClasses(String.valueOf(body.getOrDefault("classes",
                        body.getOrDefault("targetClasses", ""))))
                .status(ExamStatus.SCHEDULED)
                .resultsPublished(false)
                .createdBy(creator)
                .build();
        exam = examRepository.save(exam);
        auditLogService.log(p.getInstitutionId(), "CREATE_EXAM", "EXAM", exam.getId(),
                "Scheduled exam '" + exam.getTitle() + "' from " + exam.getStartDate() + " to " + exam.getEndDate());
        return ResponseEntity.ok(ApiResponse.ok("Exam scheduled", ExamResponse.from(exam)));
    }

    @PutMapping("/{id}/publish-results")
    public ResponseEntity<ApiResponse<ExamResponse>> publishResults(
            @PathVariable Long id, @AuthenticationPrincipal SecurityUser p) {
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(p.getInstitutionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setResultsPublished(true);
        exam.setStatus(ExamStatus.RESULTS_PUBLISHED);
        exam = examRepository.save(exam);
        auditLogService.log(p.getInstitutionId(), "PUBLISH_EXAM_RESULTS", "EXAM", exam.getId(),
                "Published results for exam '" + exam.getTitle() + "'");
        return ResponseEntity.ok(ApiResponse.ok("Results published", ExamResponse.from(exam)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ExamResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(p.getInstitutionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        try { exam.setStatus(ExamStatus.valueOf(String.valueOf(body.get("status")))); }
        catch (Exception e) { throw new BadRequestException("Invalid status"); }
        exam = examRepository.save(exam);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", ExamResponse.from(exam)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id, @AuthenticationPrincipal SecurityUser p) {
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(p.getInstitutionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        examRepository.delete(exam);
        return ResponseEntity.ok(ApiResponse.message("Exam deleted"));
    }

    private LocalDate parseDate(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        String str = String.valueOf(o).trim();
        try {
            return LocalDate.parse(str);
        } catch (Exception e) {
            try {
                return LocalDate.parse(str, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            } catch (Exception ex) {
                return null;
            }
        }
    }
}
