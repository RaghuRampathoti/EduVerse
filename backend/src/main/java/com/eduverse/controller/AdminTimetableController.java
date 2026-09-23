package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateTimetableEntryRequest;
import com.eduverse.dto.response.TimetableEntryResponse;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/timetable")
@RequiredArgsConstructor
public class AdminTimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableEntryResponse>>> listByClass(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam Long classSectionId
    ) {
        Long institutionId = principal != null ? principal.getInstitutionId() : null;
        return ResponseEntity.ok(ApiResponse.ok(timetableService.listByClassSection(institutionId, classSectionId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimetableEntryResponse>> saveEntry(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateTimetableEntryRequest request
    ) {
        Long institutionId = principal != null ? principal.getInstitutionId() : null;
        return ResponseEntity.ok(ApiResponse.ok("Timetable entry saved", timetableService.saveEntry(institutionId, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long id
    ) {
        Long institutionId = principal != null ? principal.getInstitutionId() : null;
        timetableService.deleteEntry(institutionId, id);
        return ResponseEntity.ok(ApiResponse.message("Timetable entry deleted"));
    }

    @PostMapping("/assign-first-period")
    public ResponseEntity<ApiResponse<List<TimetableEntryResponse>>> assignFirstPeriodToClassTeacher(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam Long classSectionId
    ) {
        Long institutionId = principal != null ? principal.getInstitutionId() : null;
        List<TimetableEntryResponse> result = timetableService.assignFirstPeriodToClassTeacher(institutionId, classSectionId);
        return ResponseEntity.ok(ApiResponse.ok("First period automatically assigned to Class Teacher across all days!", result));
    }
}
