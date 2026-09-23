package com.eduverse.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AuditLogService {

    /**
     * Records an audit trail entry. The acting user (id/name/role) is resolved
     * automatically from the current Spring Security context, so callers only
     * need to describe *what* happened and *where* (institutionId may be null
     * for platform-level Master Admin actions).
     */
    void log(Long institutionId, String action, String entityType, Long entityId, String description);

    /** Platform-wide trail, newest first — used by the Master Admin audit console. */
    Page<Map<String, Object>> platformLogs(Pageable pageable);

    /** Trail scoped to one institution, newest first — used by the Super Admin activity monitor. */
    Page<Map<String, Object>> institutionLogs(Long institutionId, Pageable pageable);
}
