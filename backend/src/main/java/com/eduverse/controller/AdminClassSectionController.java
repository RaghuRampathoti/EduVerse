package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateClassSectionRequest;
import com.eduverse.dto.response.ClassSectionResponse;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.ClassSectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/class-sections")
@RequiredArgsConstructor
public class AdminClassSectionController {

    private final ClassSectionService classSectionService;

    @PostMapping
    public ResponseEntity<ApiResponse<ClassSectionResponse>> create(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateClassSectionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                classSectionService.create(principal.getInstitutionId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassSectionResponse>>> list(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(classSectionService.list(principal.getInstitutionId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassSectionResponse>> update(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateClassSectionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                classSectionService.update(principal.getInstitutionId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long id
    ) {
        classSectionService.delete(principal.getInstitutionId(), id);
        return ResponseEntity.ok(ApiResponse.message("Class/Section deleted"));
    }
}
