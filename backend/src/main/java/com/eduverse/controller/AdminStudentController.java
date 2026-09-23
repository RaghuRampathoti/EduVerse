package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateStudentRequest;
import com.eduverse.dto.request.UpdateStudentRequest;
import com.eduverse.dto.response.StudentResponse;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.StudentService;
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
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponse>> create(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateStudentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Student enrolled successfully", studentService.create(principal.getInstitutionId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StudentResponse>>> list(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam(required = false) Long classSectionId,
            Pageable pageable
    ) {
        Page<StudentResponse> result = classSectionId != null
                ? studentService.listByClass(principal.getInstitutionId(), classSectionId, pageable)
                : studentService.list(principal.getInstitutionId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> get(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.get(principal.getInstitutionId(), id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> update(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long id,
            @RequestBody UpdateStudentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.update(principal.getInstitutionId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long id
    ) {
        studentService.delete(principal.getInstitutionId(), id);
        return ResponseEntity.ok(ApiResponse.message("Student removed"));
    }
}
