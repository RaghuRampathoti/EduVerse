package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.entity.*;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.HomeworkRepository;
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
@RequestMapping("/api/admin/homework")
@RequiredArgsConstructor
public class AdminHomeworkController {

    private final HomeworkRepository homeworkRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Homework>>> list(@AuthenticationPrincipal SecurityUser p) {
        return ResponseEntity.ok(ApiResponse.ok(
                homeworkRepository.findByInstitutionIdOrderByCreatedAtDesc(p.getInstitutionId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Homework>> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal SecurityUser p) {
        Institution inst = institutionRepository.getReferenceById(p.getInstitutionId());
        Homework hw = Homework.builder()
                .institution(inst)
                .title(String.valueOf(body.getOrDefault("title", "Untitled")))
                .subject(String.valueOf(body.getOrDefault("subject", "")))
                .classSection(String.valueOf(body.getOrDefault("classSection",
                        body.getOrDefault("class", ""))))
                .assignedFaculty(String.valueOf(body.getOrDefault("faculty",
                        body.getOrDefault("assignedFaculty", ""))))
                .dueDate(parseDate(body.get("dueDate")))
                .description(String.valueOf(body.getOrDefault("description", "")))
                .status(HomeworkStatus.ACTIVE)
                .submissionsCount(0)
                .build();
        hw = homeworkRepository.save(hw);
        auditLogService.log(p.getInstitutionId(), "CREATE_HOMEWORK", "HOMEWORK", hw.getId(),
                "Assigned homework '" + hw.getTitle() + "' for " + hw.getClassSection());
        return ResponseEntity.ok(ApiResponse.ok("Homework assigned", hw));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id, @AuthenticationPrincipal SecurityUser p) {
        Homework hw = homeworkRepository.findById(id)
                .filter(h -> h.getInstitution().getId().equals(p.getInstitutionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));
        homeworkRepository.delete(hw);
        return ResponseEntity.ok(ApiResponse.message("Homework deleted"));
    }

    private LocalDate parseDate(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return LocalDate.parse(String.valueOf(o)); } catch (Exception e) { return null; }
    }
}
