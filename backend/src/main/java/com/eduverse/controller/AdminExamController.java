package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<Exam>>> list(@AuthenticationPrincipal SecurityUser p) {
        return ResponseEntity.ok(ApiResponse.ok(
                examRepository.findByInstitutionIdOrderByStartDateDesc(p.getInstitutionId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Exam>> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        Institution inst = institutionRepository.getReferenceById(p.getInstitutionId());
        ExamType type;
        try { type = ExamType.valueOf(String.valueOf(body.getOrDefault("type", "MIDTERM"))); }
        catch (Exception e) { type = ExamType.MIDTERM; }

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
                .createdBy(p.getUser().getFullName())
                .build();
        exam = examRepository.save(exam);
        auditLogService.log(p.getInstitutionId(), "CREATE_EXAM", "EXAM", exam.getId(),
                "Scheduled exam '" + exam.getTitle() + "' from " + exam.getStartDate() + " to " + exam.getEndDate());
        return ResponseEntity.ok(ApiResponse.ok("Exam scheduled", exam));
    }

    @PutMapping("/{id}/publish-results")
    public ResponseEntity<ApiResponse<Exam>> publishResults(
            @PathVariable Long id, @AuthenticationPrincipal SecurityUser p) {
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(p.getInstitutionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        exam.setResultsPublished(true);
        exam.setStatus(ExamStatus.RESULTS_PUBLISHED);
        examRepository.save(exam);
        auditLogService.log(p.getInstitutionId(), "PUBLISH_EXAM_RESULTS", "EXAM", exam.getId(),
                "Published results for exam '" + exam.getTitle() + "'");
        return ResponseEntity.ok(ApiResponse.ok("Results published", exam));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Exam>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        Exam exam = examRepository.findById(id)
                .filter(e -> e.getInstitution().getId().equals(p.getInstitutionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        try { exam.setStatus(ExamStatus.valueOf(String.valueOf(body.get("status")))); }
        catch (Exception e) { throw new BadRequestException("Invalid status"); }
        examRepository.save(exam);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", exam));
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
        try { return LocalDate.parse(String.valueOf(o)); } catch (Exception e) { return null; }
    }
}
