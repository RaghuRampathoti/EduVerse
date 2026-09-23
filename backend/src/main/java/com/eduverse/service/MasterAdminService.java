package com.eduverse.service;

import com.eduverse.dto.request.CreateInstitutionRequest;
import com.eduverse.dto.request.UpdateInstitutionRequest;
import com.eduverse.dto.response.CreatedAccountResponse;
import com.eduverse.dto.response.DashboardStatsResponse;
import com.eduverse.dto.response.InstitutionCreatedResponse;
import com.eduverse.dto.response.InstitutionResponse;

import java.util.List;

public interface MasterAdminService {
    InstitutionCreatedResponse createInstitution(CreateInstitutionRequest request);
    List<InstitutionResponse> listInstitutions();
    InstitutionResponse getInstitution(Long id);
    InstitutionResponse updateInstitution(Long id, UpdateInstitutionRequest request);
    void deleteInstitution(Long id);
    CreatedAccountResponse resetSuperAdminPassword(Long institutionId);
    List<com.eduverse.dto.response.SuperAdminResponse> listSuperAdmins();
    void deleteSuperAdmin(Long id);
    DashboardStatsResponse getDashboardStats();

    // Additional Master Admin operational modules
    List<Object> getSubscriptionPlans();
    Object createSubscriptionPlan(Object request);
    List<Object> getSubscriptionLifecycle();
    Object updateSubscriptionLifecycle(Long institutionId, Object payload);
    Object getBillingReports();
    Object getFeatureEntitlements();
    Object updateFeatureEntitlement(Long id, Object payload);
    Object getPlatformReports();
    List<Object> getAuditLogs();
    List<Object> getSupportNotices();
    Object createSupportNotice(Object payload);
    Object getSystemConfig();
    Object updateSystemConfig(Object payload);
    List<Object> getInstitutionAuditLogs(Long institutionId);
}
