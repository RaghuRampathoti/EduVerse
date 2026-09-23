package com.eduverse.service.impl;

import com.eduverse.entity.AuditLog;
import com.eduverse.entity.Institution;
import com.eduverse.repository.AuditLogRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final AuditLogRepository auditLogRepository;
    private final InstitutionRepository institutionRepository;

    @Override
    @Transactional
    public void log(Long institutionId, String action, String entityType, Long entityId, String description) {
        Long actorUserId = null;
        String actorName = "SYSTEM";
        com.eduverse.entity.Role actorRole = null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof SecurityUser securityUser) {
            actorUserId = securityUser.getUserId();
            actorName = securityUser.getUser().getFullName();
            actorRole = securityUser.getUser().getRole();
            if (institutionId == null) {
                institutionId = securityUser.getInstitutionId();
            }
        }

        Institution institution = institutionId != null ? institutionRepository.findById(institutionId).orElse(null) : null;

        AuditLog entry = AuditLog.builder()
                .institution(institution)
                .actorUserId(actorUserId)
                .actorName(actorName)
                .actorRole(actorRole)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .status("SUCCESS")
                .build();
        auditLogRepository.save(entry);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Map<String, Object>> platformLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toPlatformRow);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Map<String, Object>> institutionLogs(Long institutionId, Pageable pageable) {
        return auditLogRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId, pageable).map(this::toInstitutionRow);
    }

    private Map<String, Object> toPlatformRow(AuditLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("timestamp", log.getCreatedAt() != null ? log.getCreatedAt().format(TS_FORMAT) : "");
        row.put("user", log.getActorName());
        row.put("role", log.getActorRole() != null ? log.getActorRole().name() : "SYSTEM");
        row.put("action", log.getAction());
        row.put("target", log.getEntityType() + (log.getEntityId() != null ? " #" + log.getEntityId() : ""));
        row.put("details", log.getDescription());
        row.put("ip", "internal");
        row.put("status", log.getStatus());
        return row;
    }

    private Map<String, Object> toInstitutionRow(AuditLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("timestamp", log.getCreatedAt() != null ? log.getCreatedAt().format(TS_FORMAT) : "");
        row.put("admin", log.getActorName());
        row.put("role", log.getActorRole() != null ? log.getActorRole().name() : "SYSTEM");
        row.put("campus", log.getInstitution() != null ? log.getInstitution().getName() : "N/A");
        row.put("action", log.getAction());
        row.put("details", log.getDescription());
        row.put("status", log.getStatus());
        return row;
    }
}
