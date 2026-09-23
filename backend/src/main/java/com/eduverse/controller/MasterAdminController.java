package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateInstitutionRequest;
import com.eduverse.dto.request.UpdateInstitutionRequest;
import com.eduverse.dto.response.CreatedAccountResponse;
import com.eduverse.dto.response.DashboardStatsResponse;
import com.eduverse.dto.response.InstitutionCreatedResponse;
import com.eduverse.dto.response.InstitutionResponse;
import com.eduverse.service.MasterAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Master Admin exclusive endpoints: create institutions (auto-provisions the
 * Super Admin account for that institution), manage lifecycle, view platform-wide stats.
 */
@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterAdminController {

    private final MasterAdminService masterAdminService;

    @PostMapping("/institutions")
    public ResponseEntity<ApiResponse<InstitutionCreatedResponse>> createInstitution(
            @Valid @RequestBody CreateInstitutionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Institution created and Super Admin account provisioned",
                masterAdminService.createInstitution(request)
        ));
    }

    @GetMapping("/institutions")
    public ResponseEntity<ApiResponse<List<InstitutionResponse>>> listInstitutions() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.listInstitutions()));
    }

    @GetMapping("/institutions/{id}")
    public ResponseEntity<ApiResponse<InstitutionResponse>> getInstitution(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getInstitution(id)));
    }

    @PutMapping("/institutions/{id}")
    public ResponseEntity<ApiResponse<InstitutionResponse>> updateInstitution(
            @PathVariable Long id, @RequestBody UpdateInstitutionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.updateInstitution(id, request)));
    }

    @DeleteMapping("/institutions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInstitution(@PathVariable Long id) {
        masterAdminService.deleteInstitution(id);
        return ResponseEntity.ok(ApiResponse.message("Institution deleted"));
    }

    @PostMapping("/institutions/{id}/reset-super-admin-password")
    public ResponseEntity<ApiResponse<CreatedAccountResponse>> resetSuperAdminPassword(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.resetSuperAdminPassword(id)));
    }

    @GetMapping("/super-admins")
    public ResponseEntity<ApiResponse<List<com.eduverse.dto.response.SuperAdminResponse>>> listSuperAdmins() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.listSuperAdmins()));
    }

    @DeleteMapping("/super-admins/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSuperAdmin(@PathVariable Long id) {
        masterAdminService.deleteSuperAdmin(id);
        return ResponseEntity.ok(ApiResponse.message("Super Admin removed"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getDashboardStats()));
    }

    @GetMapping("/subscription-plans")
    public ResponseEntity<ApiResponse<List<Object>>> getSubscriptionPlans() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getSubscriptionPlans()));
    }

    @PostMapping("/subscription-plans")
    public ResponseEntity<ApiResponse<Object>> createSubscriptionPlan(@RequestBody Object request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan created", masterAdminService.createSubscriptionPlan(request)));
    }

    @GetMapping("/subscriptions/lifecycle")
    public ResponseEntity<ApiResponse<List<Object>>> getSubscriptionLifecycle() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getSubscriptionLifecycle()));
    }

    @PutMapping("/subscriptions/lifecycle/{id}")
    public ResponseEntity<ApiResponse<Object>> updateSubscriptionLifecycle(@PathVariable Long id, @RequestBody Object payload) {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.updateSubscriptionLifecycle(id, payload)));
    }

    @GetMapping("/billing/reports")
    public ResponseEntity<ApiResponse<Object>> getBillingReports() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getBillingReports()));
    }

    @GetMapping("/entitlements")
    public ResponseEntity<ApiResponse<Object>> getFeatureEntitlements() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getFeatureEntitlements()));
    }

    @PutMapping("/entitlements/{id}")
    public ResponseEntity<ApiResponse<Object>> updateFeatureEntitlement(@PathVariable Long id, @RequestBody Object payload) {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.updateFeatureEntitlement(id, payload)));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Object>> getPlatformReports() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getPlatformReports()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<Object>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getAuditLogs()));
    }

    @GetMapping("/support/notices")
    public ResponseEntity<ApiResponse<List<Object>>> getSupportNotices() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getSupportNotices()));
    }

    @PostMapping("/support/notices")
    public ResponseEntity<ApiResponse<Object>> createSupportNotice(@RequestBody Object payload) {
        return ResponseEntity.ok(ApiResponse.ok("Notice created", masterAdminService.createSupportNotice(payload)));
    }

    @GetMapping("/system-config")
    public ResponseEntity<ApiResponse<Object>> getSystemConfig() {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getSystemConfig()));
    }

    @PutMapping("/system-config")
    public ResponseEntity<ApiResponse<Object>> updateSystemConfig(@RequestBody Object payload) {
        return ResponseEntity.ok(ApiResponse.ok("Configuration updated", masterAdminService.updateSystemConfig(payload)));
    }

    /** Institution-scoped audit logs for Master Admin drill-down (e.g. GET /api/master/institutions/{id}/audit-logs) */
    @GetMapping("/institutions/{id}/audit-logs")
    public ResponseEntity<ApiResponse<List<Object>>> getInstitutionAuditLogs(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(masterAdminService.getInstitutionAuditLogs(id)));
    }
}
