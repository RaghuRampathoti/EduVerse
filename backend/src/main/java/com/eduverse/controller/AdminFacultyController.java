package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateFacultyRequest;
import com.eduverse.dto.request.UpdateFacultyRequest;
import com.eduverse.dto.response.FacultyResponse;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/faculty")
@RequiredArgsConstructor
public class AdminFacultyController {

    private final FacultyService facultyService;

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyResponse>> create(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateFacultyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Faculty added successfully", facultyService.create(principal.getInstitutionId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FacultyResponse>>> list(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam(required = false) String institutionType,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(facultyService.list(principal.getInstitutionId(), institutionType, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponse>> get(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.ok(facultyService.get(principal.getInstitutionId(), id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponse>> update(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long id,
            @RequestBody UpdateFacultyRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(facultyService.update(principal.getInstitutionId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long id
    ) {
        facultyService.delete(principal.getInstitutionId(), id);
        return ResponseEntity.ok(ApiResponse.message("Faculty removed"));
    }
}
