package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateInstitutionRequest;
import com.eduverse.dto.request.UpdateInstitutionRequest;
import com.eduverse.dto.response.CreatedAccountResponse;
import com.eduverse.dto.response.DashboardStatsResponse;
import com.eduverse.dto.response.InstitutionCreatedResponse;
import com.eduverse.dto.response.InstitutionResponse;
import com.eduverse.entity.BillingCycle;
import com.eduverse.entity.FeatureEntitlement;
import com.eduverse.entity.Institution;
import com.eduverse.entity.InstitutionStatus;
import com.eduverse.entity.InstitutionType;
import com.eduverse.entity.InstitutionSubscription;
import com.eduverse.entity.PlanStatus;
import com.eduverse.entity.Role;
import com.eduverse.entity.SubscriptionPlan;
import com.eduverse.entity.SubscriptionStatus;
import com.eduverse.entity.SupportNotice;
import com.eduverse.entity.SystemConfig;
import com.eduverse.entity.User;
import com.eduverse.entity.UserStatus;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.AuditLogRepository;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.FeatureEntitlementRepository;
import com.eduverse.repository.FeePaymentRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.InstitutionSubscriptionRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.repository.SubscriptionPlanRepository;
import com.eduverse.repository.SupportNoticeRepository;
import com.eduverse.repository.SystemConfigRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.AuditLogService;
import com.eduverse.service.MasterAdminService;
import com.eduverse.service.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MasterAdminServiceImpl implements MasterAdminService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;
    private final AuditLogService auditLogService;
    private final AuditLogRepository auditLogRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final InstitutionSubscriptionRepository institutionSubscriptionRepository;
    private final SupportNoticeRepository supportNoticeRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final FeatureEntitlementRepository featureEntitlementRepository;

    @Override
    @Transactional
    public InstitutionCreatedResponse createInstitution(CreateInstitutionRequest request) {
        if (institutionRepository.existsByCode(request.code())) {
            throw new BadRequestException("An institution with code '" + request.code() + "' already exists");
        }
        if (userRepository.existsByEmail(request.superAdminEmail())) {
            throw new BadRequestException("An account with email '" + request.superAdminEmail() + "' already exists");
        }
        if (request.superAdminUsername() != null && !request.superAdminUsername().isBlank()
                && userRepository.findByUsername(request.superAdminUsername()).isPresent()) {
            throw new BadRequestException("An account with username '" + request.superAdminUsername() + "' already exists");
        }

        Institution institution = Institution.builder()
                .name(request.name())
                .code(request.code())
                .type(request.type() != null ? request.type() : InstitutionType.SCHOOL)
                .status(InstitutionStatus.ACTIVE)
                .phone(request.phone())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .postalCode(request.postalCode())
                .establishedYear(request.establishedYear())
                .maxStudents(request.maxStudents() != null ? request.maxStudents() : 1000)
                .build();
        institution = institutionRepository.save(institution);

        String tempPassword = request.superAdminPassword() != null && !request.superAdminPassword().isBlank()
            ? request.superAdminPassword()
            : passwordGenerator.generate();
        boolean mustChange = request.superAdminPassword() == null || request.superAdminPassword().isBlank();
        User superAdmin = User.builder()
            .email(request.superAdminEmail())
            .username(request.superAdminUsername() != null && !request.superAdminUsername().isBlank() ? request.superAdminUsername() : null)
            .password(passwordEncoder.encode(tempPassword))
            .fullName(request.superAdminFullName())
            .phone(request.superAdminPhone())
            .role(Role.SUPER_ADMIN)
            .status(UserStatus.ACTIVE)
            .institution(institution)
            .mustChangePassword(mustChange)
            .build();
        superAdmin = userRepository.save(superAdmin);

        // Auto-provision a Free Trial subscription for the newly created institution
        SubscriptionPlan freeTrial = subscriptionPlanRepository.findByCode("FREE_TRIAL").orElse(null);
        institutionSubscriptionRepository.save(InstitutionSubscription.builder()
                .institution(institution)
                .plan(freeTrial)
                .status(SubscriptionStatus.ACTIVE)
                .startDate(LocalDate.now())
                .nextBillingDate(LocalDate.now().plusDays(30))
                .autoRenew(true)
                .build());

        auditLogService.log(institution.getId(), "CREATE_INSTITUTION", "INSTITUTION", institution.getId(),
                "Created institution '" + institution.getName() + "' (" + institution.getCode() + ") and provisioned Super Admin " + superAdmin.getEmail());

        InstitutionResponse institutionResponse = InstitutionResponse.from(institution, 0, 0);
        CreatedAccountResponse account = new CreatedAccountResponse(superAdmin.getId(), superAdmin.getEmail(), superAdmin.getUsername(), tempPassword);
        return new InstitutionCreatedResponse(institutionResponse, account);
    }

    @Override
    public List<InstitutionResponse> listInstitutions() {
        return institutionRepository.findAll().stream()
                .map(this::toResponseWithCounts)
                .toList();
    }

    @Override
    public InstitutionResponse getInstitution(Long id) {
        Institution institution = findInstitution(id);
        return toResponseWithCounts(institution);
    }

    @Override
    @Transactional
    public InstitutionResponse updateInstitution(Long id, UpdateInstitutionRequest request) {
        Institution institution = findInstitution(id);

        if (request.name() != null) institution.setName(request.name());
        if (request.code() != null && !request.code().isBlank() && !request.code().equalsIgnoreCase(institution.getCode())) {
            if (institutionRepository.existsByCode(request.code())) {
                throw new BadRequestException("An institution with code '" + request.code() + "' already exists");
            }
            institution.setCode(request.code());
        }
        if (request.type() != null) institution.setType(request.type());
        if (request.phone() != null) institution.setPhone(request.phone());
        if (request.address() != null) institution.setAddress(request.address());
        if (request.city() != null) institution.setCity(request.city());
        if (request.state() != null) institution.setState(request.state());
        if (request.country() != null) institution.setCountry(request.country());
        if (request.postalCode() != null) institution.setPostalCode(request.postalCode());
        if (request.logoUrl() != null) institution.setLogoUrl(request.logoUrl());
        if (request.primaryColor() != null) institution.setPrimaryColor(request.primaryColor());
        if (request.establishedYear() != null) institution.setEstablishedYear(request.establishedYear());
        if (request.maxStudents() != null) institution.setMaxStudents(request.maxStudents());
        if (request.status() != null) institution.setStatus(request.status());

        institution = institutionRepository.save(institution);
        auditLogService.log(institution.getId(), "UPDATE_INSTITUTION", "INSTITUTION", institution.getId(),
                "Updated institution profile for '" + institution.getName() + "'");
        return toResponseWithCounts(institution);
    }

    @Override
    @Transactional
    public void deleteInstitution(Long id) {
        Institution institution = findInstitution(id);
        auditLogService.log(null, "DELETE_INSTITUTION", "INSTITUTION", institution.getId(),
                "Deleted institution '" + institution.getName() + "' (" + institution.getCode() + ")");
        institutionRepository.delete(institution);
    }

    @Override
    @Transactional
    public CreatedAccountResponse resetSuperAdminPassword(Long institutionId) {
        Institution institution = findInstitution(institutionId);
        User superAdmin = userRepository.findByInstitutionIdAndRole(institutionId, Role.SUPER_ADMIN,
                        PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No Super Admin found for institution " + institution.getName()));

        String tempPassword = passwordGenerator.generate();
        superAdmin.setPassword(passwordEncoder.encode(tempPassword));
        superAdmin.setMustChangePassword(true);
        userRepository.save(superAdmin);
        auditLogService.log(institutionId, "RESET_SUPER_ADMIN_PASSWORD", "USER", superAdmin.getId(),
                "Reset Super Admin password for '" + institution.getName() + "'");
        return new CreatedAccountResponse(superAdmin.getId(), superAdmin.getEmail(), superAdmin.getUsername(), tempPassword);
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.eduverse.dto.response.SuperAdminResponse> listSuperAdmins() {
        return userRepository.findByRole(Role.SUPER_ADMIN).stream()
                .map(u -> new com.eduverse.dto.response.SuperAdminResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getPhone(),
                        u.getStatus(),
                        u.getInstitution() != null ? u.getInstitution().getId() : null,
                        u.getInstitution() != null ? u.getInstitution().getName() : "N/A",
                        u.getInstitution() != null ? u.getInstitution().getCode() : "N/A",
                        u.getInstitution() != null && u.getInstitution().getType() != null ? u.getInstitution().getType().name() : "SCHOOL"
                ))
                .toList();
    }

    @Override
    @Transactional
    public void deleteSuperAdmin(Long id) {
        User superAdmin = userRepository.findById(id)
                .orElse(null);
        if (superAdmin != null) {
            auditLogService.log(
                    superAdmin.getInstitution() != null ? superAdmin.getInstitution().getId() : null,
                    "DELETE_SUPER_ADMIN", "USER", superAdmin.getId(),
                    "Deleted Super Admin '" + superAdmin.getFullName() + "' (" + superAdmin.getEmail() + ")"
            );
            userRepository.delete(superAdmin);
        }
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        List<Institution> institutions = institutionRepository.findAll();
        long totalInstitutions = institutions.size();
        long activeInstitutions = institutions.stream().filter(i -> i.getStatus() == InstitutionStatus.ACTIVE).count();

        Map<String, Long> byType = new HashMap<>();
        for (Institution i : institutions) {
            byType.merge(i.getType().name(), 1L, Long::sum);
        }

        long totalStudents = studentProfileRepository.count();
        long totalFaculty = facultyProfileRepository.count();
        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        double collected = institutions.stream()
                .mapToDouble(i -> safe(feePaymentRepository.sumAmountCollectedByInstitution(i.getId())))
                .sum();
        double pending = institutions.stream()
                .mapToDouble(i -> safe(feePaymentRepository.sumAmountPendingByInstitution(i.getId())))
                .sum();

        return new DashboardStatsResponse(
                totalInstitutions, totalStudents, totalFaculty, totalAdmins, activeInstitutions,
                byType, collected, pending, 0, 0
        );
    }

    private double safe(Double val) {
        return val == null ? 0.0 : val;
    }

    private Institution findInstitution(Long id) {
        return institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found with id " + id));
    }

    private InstitutionResponse toResponseWithCounts(Institution institution) {
        long students = studentProfileRepository.countByInstitutionId(institution.getId());
        long faculty = facultyProfileRepository.countByInstitutionId(institution.getId());
        return InstitutionResponse.from(institution, students, faculty);
    }

    // ---------------------------------------------------------------
    // Subscription Plans (persisted)
    // ---------------------------------------------------------------

    private Map<String, Object> planToMap(SubscriptionPlan plan) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", plan.getId());
        map.put("name", plan.getName());
        map.put("code", plan.getCode());
        map.put("price", plan.getPrice());
        map.put("billingCycle", plan.getBillingCycle().name());
        map.put("validityPeriod", plan.getValidityPeriod());
        map.put("maxStudents", plan.getMaxStudents());
        map.put("maxFaculty", plan.getMaxFaculty());
        map.put("storageGb", plan.getStorageGb());
        map.put("status", plan.getStatus().name());
        map.put("modules", plan.getModules());
        return map;
    }

    @Override
    public List<Object> getSubscriptionPlans() {
        return subscriptionPlanRepository.findAll().stream().map(p -> (Object) planToMap(p)).toList();
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Object createSubscriptionPlan(Object request) {
        Map<String, Object> body = (Map<String, Object>) request;
        String code = String.valueOf(body.getOrDefault("code", "")).toUpperCase().replace(" ", "_");
        if (code.isBlank()) {
            throw new BadRequestException("Plan code is required");
        }
        if (subscriptionPlanRepository.existsByCode(code)) {
            throw new BadRequestException("A plan with code '" + code + "' already exists");
        }
        BillingCycle cycle = BillingCycle.valueOf(String.valueOf(body.getOrDefault("billingCycle", "MONTHLY")).toUpperCase());
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(String.valueOf(body.getOrDefault("name", code)))
                .code(code)
                .price(toDouble(body.get("price")))
                .billingCycle(cycle)
                .validityPeriod(String.valueOf(body.getOrDefault("validityPeriod",
                        cycle == BillingCycle.ANNUAL ? "1 Year (365 Days)" : "1 Month (30 Days)")))
                .maxStudents((int) toDouble(body.getOrDefault("maxStudents", 500)))
                .maxFaculty((int) toDouble(body.getOrDefault("maxFaculty", 50)))
                .storageGb((int) toDouble(body.getOrDefault("storageGb", 50)))
                .status(PlanStatus.ACTIVE)
                .modules(body.get("modules") instanceof List ? new ArrayList<>((List<String>) body.get("modules")) : new ArrayList<>())
                .build();
        plan = subscriptionPlanRepository.save(plan);
        auditLogService.log(null, "CREATE_SUBSCRIPTION_PLAN", "SUBSCRIPTION_PLAN", plan.getId(),
                "Created subscription plan '" + plan.getName() + "' (" + plan.getCode() + ")");
        return planToMap(plan);
    }

    private double toDouble(Object o) {
        if (o == null) return 0;
        if (o instanceof Number n) return n.doubleValue();
        return Double.parseDouble(String.valueOf(o));
    }

    // ---------------------------------------------------------------
    // Subscription Lifecycle (persisted, keyed by institutionId)
    // ---------------------------------------------------------------

    @Override
    public List<Object> getSubscriptionLifecycle() {
        List<Institution> institutions = institutionRepository.findAll();
        List<Object> result = new ArrayList<>();
        for (Institution inst : institutions) {
            InstitutionSubscription sub = institutionSubscriptionRepository.findByInstitutionId(inst.getId()).orElse(null);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("institutionId", inst.getId());
            row.put("institutionName", inst.getName());
            row.put("institutionCode", inst.getCode());
            row.put("planName", sub != null && sub.getPlan() != null ? sub.getPlan().getName() : "No Plan Assigned");
            row.put("status", inst.getStatus().name());
            row.put("lifecycleStage", sub != null ? sub.getStatus().name() : "ACTIVE");
            row.put("startDate", sub != null && sub.getStartDate() != null ? sub.getStartDate().format(DATE_FORMAT) : "-");
            row.put("nextBillingDate", sub != null && sub.getNextBillingDate() != null ? sub.getNextBillingDate().format(DATE_FORMAT) : "-");
            row.put("autoRenew", sub != null && sub.isAutoRenew());
            result.add(row);
        }
        return result;
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Object updateSubscriptionLifecycle(Long institutionId, Object payload) {
        Institution institution = findInstitution(institutionId);
        InstitutionSubscription sub = institutionSubscriptionRepository.findByInstitutionId(institutionId)
                .orElseGet(() -> InstitutionSubscription.builder().institution(institution).startDate(LocalDate.now()).build());

        Map<String, Object> body = (Map<String, Object>) payload;
        String stage = String.valueOf(body.getOrDefault("stage", body.getOrDefault("status", ""))).toUpperCase();
        if (!stage.isBlank()) {
            try {
                sub.setStatus(SubscriptionStatus.valueOf(stage));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Unknown lifecycle stage: " + stage);
            }
        }
        if (body.get("autoRenew") != null) {
            sub.setAutoRenew(Boolean.parseBoolean(String.valueOf(body.get("autoRenew"))));
        }
        if (sub.getNextBillingDate() == null) {
            sub.setNextBillingDate(LocalDate.now().plusDays(30));
        }
        sub = institutionSubscriptionRepository.save(sub);

        // Keep the institution's own status in sync with severe lifecycle stages
        if (sub.getStatus() == SubscriptionStatus.EXPIRED || sub.getStatus() == SubscriptionStatus.SUSPENDED
                || sub.getStatus() == SubscriptionStatus.CANCELLED) {
            institution.setStatus(InstitutionStatus.SUSPENDED);
        } else {
            institution.setStatus(InstitutionStatus.ACTIVE);
        }
        institutionRepository.save(institution);

        auditLogService.log(institutionId, "UPDATE_SUBSCRIPTION_LIFECYCLE", "INSTITUTION_SUBSCRIPTION", sub.getId(),
                "Set subscription lifecycle for '" + institution.getName() + "' to " + sub.getStatus());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Lifecycle state updated successfully");
        response.put("institutionId", institutionId);
        response.put("lifecycleStage", sub.getStatus().name());
        return response;
    }

    // ---------------------------------------------------------------
    // Billing Reports (derived from real fee payment data)
    // ---------------------------------------------------------------

    @Override
    public Object getBillingReports() {
        List<Institution> institutions = institutionRepository.findAll();
        double collected = institutions.stream()
                .mapToDouble(i -> safe(feePaymentRepository.sumAmountCollectedByInstitution(i.getId())))
                .sum();
        double pending = institutions.stream()
                .mapToDouble(i -> safe(feePaymentRepository.sumAmountPendingByInstitution(i.getId())))
                .sum();
        long successfulPayments = institutions.stream()
                .mapToLong(i -> feePaymentRepository.countByInstitutionIdAndStatus(i.getId(), com.eduverse.entity.PaymentStatus.PAID))
                .sum();
        long pendingPayments = institutions.stream()
                .mapToLong(i -> feePaymentRepository.countByInstitutionIdAndStatus(i.getId(), com.eduverse.entity.PaymentStatus.PENDING))
                .sum();

        List<Object> transactions = new ArrayList<>();
        for (Institution inst : institutions) {
            InstitutionSubscription sub = institutionSubscriptionRepository.findByInstitutionId(inst.getId()).orElse(null);
            if (sub == null || sub.getPlan() == null || sub.getPlan().getPrice() <= 0) continue;
            Map<String, Object> txn = new LinkedHashMap<>();
            txn.put("id", "TXN-" + inst.getId());
            txn.put("orgName", inst.getName());
            txn.put("plan", sub.getPlan().getName());
            txn.put("amount", sub.getPlan().getPrice());
            txn.put("date", sub.getStartDate() != null ? sub.getStartDate().format(DATE_FORMAT) : "-");
            txn.put("status", sub.getStatus() == SubscriptionStatus.ACTIVE ? "SUCCESS" : sub.getStatus().name());
            transactions.add(txn);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRevenue", collected);
        result.put("monthlyRecurringRevenue", collected);
        result.put("successfulPayments", successfulPayments);
        result.put("pendingPayments", pendingPayments);
        result.put("failedPayments", 0);
        result.put("refundedAmount", 0.0);
        result.put("outstandingAmount", pending);
        result.put("transactions", transactions);
        return result;
    }

    // ---------------------------------------------------------------
    // Feature Entitlements (persisted)
    // ---------------------------------------------------------------

    private Map<String, Object> entitlementToMap(FeatureEntitlement e) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", e.getId());
        map.put("moduleName", e.getModuleName());
        map.put("code", e.getCode());
        map.put("enabledGlobal", e.isEnabledGlobal());
        map.put("plansAllowed", e.getPlansAllowed());
        return map;
    }

    @Override
    public Object getFeatureEntitlements() {
        return featureEntitlementRepository.findAll().stream().map(this::entitlementToMap).toList();
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Object updateFeatureEntitlement(Long id, Object payload) {
        FeatureEntitlement entitlement = featureEntitlementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feature entitlement not found"));
        Map<String, Object> body = (Map<String, Object>) payload;
        if (body.get("enabled") != null) {
            entitlement.setEnabledGlobal(Boolean.parseBoolean(String.valueOf(body.get("enabled"))));
        }
        if (body.get("enabledGlobal") != null) {
            entitlement.setEnabledGlobal(Boolean.parseBoolean(String.valueOf(body.get("enabledGlobal"))));
        }
        if (body.get("plansAllowed") instanceof List) {
            entitlement.setPlansAllowed(new ArrayList<>((List<String>) body.get("plansAllowed")));
        }
        entitlement = featureEntitlementRepository.save(entitlement);
        auditLogService.log(null, "UPDATE_FEATURE_ENTITLEMENT", "FEATURE_ENTITLEMENT", entitlement.getId(),
                "Toggled feature '" + entitlement.getModuleName() + "' to " + (entitlement.isEnabledGlobal() ? "enabled" : "disabled"));
        return Map.of("message", "Feature entitlement updated", "id", id, "enabledGlobal", entitlement.isEnabledGlobal());
    }

    // ---------------------------------------------------------------
    // Platform Reports
    // ---------------------------------------------------------------

    @Override
    public Object getPlatformReports() {
        long totalInstitutions = institutionRepository.count();
        long totalUsers = userRepository.count();
        long attendanceLogs = auditLogRepository.count();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orgGrowth", List.of());
        result.put("userGrowth", List.of());
        result.put("storageGbUsed", 0.0);
        result.put("storageGbTotal", 2000.0);
        result.put("apiCallsToday", attendanceLogs);
        result.put("attendanceLogsCount", attendanceLogs);
        result.put("totalInstitutions", totalInstitutions);
        result.put("totalUsers", totalUsers);
        return result;
    }

    // ---------------------------------------------------------------
    // Audit Logs (real, persisted trail — populated by AuditLogService)
    // ---------------------------------------------------------------

    @Override
    public List<Object> getAuditLogs() {
        return auditLogService.platformLogs(PageRequest.of(0, 500)).getContent().stream()
                .map(m -> (Object) m).toList();
    }

    // ---------------------------------------------------------------
    // Support Notices (persisted)
    // ---------------------------------------------------------------

    private Map<String, Object> noticeToMap(SupportNotice n) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", n.getId());
        map.put("title", n.getTitle());
        map.put("content", n.getContent());
        map.put("audience", n.getAudience());
        map.put("priority", n.getPriority());
        map.put("status", n.getStatus());
        map.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "");
        return map;
    }

    @Override
    public List<Object> getSupportNotices() {
        return supportNoticeRepository.findAllByOrderByCreatedAtDesc().stream().map(n -> (Object) noticeToMap(n)).toList();
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Object createSupportNotice(Object payload) {
        Map<String, Object> body = (Map<String, Object>) payload;
        SupportNotice notice = SupportNotice.builder()
                .title(String.valueOf(body.getOrDefault("title", "Untitled Notice")))
                .content(String.valueOf(body.getOrDefault("content", "")))
                .audience(String.valueOf(body.getOrDefault("audience", "ALL_SUPER_ADMINS")))
                .priority(String.valueOf(body.getOrDefault("priority", "MEDIUM")))
                .status("ACTIVE")
                .build();
        notice = supportNoticeRepository.save(notice);
        auditLogService.log(null, "BROADCAST_NOTICE", "SUPPORT_NOTICE", notice.getId(),
                "Broadcast notice '" + notice.getTitle() + "' to " + notice.getAudience());
        return noticeToMap(notice);
    }

    // ---------------------------------------------------------------
    // System Configuration (persisted singleton)
    // ---------------------------------------------------------------

    private SystemConfig loadOrCreateConfig() {
        return systemConfigRepository.findAll().stream().findFirst()
                .orElseGet(() -> systemConfigRepository.save(SystemConfig.builder().build()));
    }

    private Map<String, Object> configToMap(SystemConfig c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("smtpHost", c.getSmtpHost());
        map.put("smtpPort", c.getSmtpPort());
        map.put("senderEmail", c.getSenderEmail());
        map.put("smsGatewayProvider", c.getSmsGatewayProvider());
        map.put("storageProvider", c.getStorageProvider());
        map.put("defaultAcademicYear", c.getDefaultAcademicYear());
        map.put("maintenanceMode", c.isMaintenanceMode());
        map.put("allowSelfRegistration", c.isAllowSelfRegistration());
        return map;
    }

    @Override
    public Object getSystemConfig() {
        return configToMap(loadOrCreateConfig());
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Object updateSystemConfig(Object payload) {
        SystemConfig config = loadOrCreateConfig();
        Map<String, Object> body = (Map<String, Object>) payload;
        if (body.get("smtpHost") != null) config.setSmtpHost(String.valueOf(body.get("smtpHost")));
        if (body.get("smtpPort") != null) config.setSmtpPort((int) toDouble(body.get("smtpPort")));
        if (body.get("senderEmail") != null) config.setSenderEmail(String.valueOf(body.get("senderEmail")));
        if (body.get("smsGatewayProvider") != null) config.setSmsGatewayProvider(String.valueOf(body.get("smsGatewayProvider")));
        if (body.get("storageProvider") != null) config.setStorageProvider(String.valueOf(body.get("storageProvider")));
        if (body.get("defaultAcademicYear") != null) config.setDefaultAcademicYear(String.valueOf(body.get("defaultAcademicYear")));
        if (body.get("maintenanceMode") != null) config.setMaintenanceMode(Boolean.parseBoolean(String.valueOf(body.get("maintenanceMode"))));
        if (body.get("allowSelfRegistration") != null) config.setAllowSelfRegistration(Boolean.parseBoolean(String.valueOf(body.get("allowSelfRegistration"))));
        config = systemConfigRepository.save(config);
        auditLogService.log(null, "UPDATE_SYSTEM_CONFIG", "SYSTEM_CONFIG", config.getId(), "Updated platform system configuration");
        return Map.of("message", "System configuration saved successfully", "config", configToMap(config));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object> getInstitutionAuditLogs(Long institutionId) {
        findInstitution(institutionId); // throws if not found
        return auditLogService.institutionLogs(institutionId, PageRequest.of(0, 500)).getContent()
                .stream().map(m -> (Object) m).toList();
    }
}
