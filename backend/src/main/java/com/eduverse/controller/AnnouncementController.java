package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateAnnouncementRequest;
import com.eduverse.dto.response.AnnouncementResponse;
import com.eduverse.entity.Role;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Every role (Master Admin excluded, since it has no institution) can read
 * announcements scoped to their institution and their audience.
 * Only Admin/Super Admin/Faculty can post them.
 */
@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AnnouncementResponse>>> list(
            @AuthenticationPrincipal SecurityUser principal,
            Pageable pageable
    ) {
        Role role = principal.getUser().getRole();
        return ResponseEntity.ok(ApiResponse.ok(
                announcementService.listForAudience(principal.getInstitutionId(), role, pageable)
        ));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> create(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateAnnouncementRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Announcement posted",
                announcementService.create(principal.getInstitutionId(), principal.getUserId(), request)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'FACULTY')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long id
    ) {
        announcementService.delete(principal.getInstitutionId(), id);
        return ResponseEntity.ok(ApiResponse.message("Announcement deleted"));
    }
}
