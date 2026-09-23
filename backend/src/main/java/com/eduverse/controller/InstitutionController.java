package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateUserRequest;
import com.eduverse.dto.request.UpdateInstitutionRequest;
import com.eduverse.dto.response.CreatedAccountResponse;
import com.eduverse.dto.response.InstitutionResponse;
import com.eduverse.dto.response.UserResponse;
import com.eduverse.entity.UserStatus;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AdminAccountService;
import com.eduverse.service.AuditLogService;
import com.eduverse.service.InstitutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

import java.util.List;
import java.util.Map;

/**
 * Super Admin's self-service area: manage own institution's profile and
 * create/manage the Admin accounts within it.
 */
@RestController
@RequestMapping("/api/institution")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;
    private final AdminAccountService adminAccountService;
    private final AuditLogService auditLogService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<InstitutionResponse>> getMyInstitution(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(institutionService.getMyInstitution(principal.getInstitutionId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<InstitutionResponse>> updateMyInstitution(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestBody UpdateInstitutionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                institutionService.updateMyInstitution(principal.getInstitutionId(), request)));
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<CreatedAccountResponse>> createAdmin(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateUserRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Admin account created", adminAccountService.createAdmin(principal.getInstitutionId(), request)));
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listAdmins(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminAccountService.listAdmins(principal.getInstitutionId())));
    }

    @PutMapping("/admins/{adminUserId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateAdminStatus(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long adminUserId,
            @RequestBody java.util.Map<String, String> body
    ) {
        UserStatus status = UserStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok(
                adminAccountService.updateAdminStatus(principal.getInstitutionId(), adminUserId, status)));
    }

    @DeleteMapping("/admins/{adminUserId}")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long adminUserId
    ) {
        adminAccountService.deleteAdmin(principal.getInstitutionId(), adminUserId);
        return ResponseEntity.ok(ApiResponse.message("Admin account deleted"));
    }

    @PostMapping("/admins/{adminUserId}/reset-password")
    public ResponseEntity<ApiResponse<CreatedAccountResponse>> resetAdminPassword(
            @AuthenticationPrincipal SecurityUser principal,
            @PathVariable Long adminUserId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                adminAccountService.resetAdminPassword(principal.getInstitutionId(), adminUserId)));
    }

    /**
     * Super Admin: get per-institution admin activity / audit trail.
     * Accessible at GET /api/institution/activity-logs
     */
    @GetMapping("/activity-logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActivityLogs(
            @AuthenticationPrincipal SecurityUser principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size
    ) {
        List<Map<String, Object>> logs = auditLogService
                .institutionLogs(principal.getInstitutionId(),
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
