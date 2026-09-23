package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Immutable trail of every meaningful action performed on the platform:
 * Master Admin provisioning institutions, Super Admin creating Admin accounts,
 * and Admins managing classes/students/faculty/fees/attendance/timetable/announcements.
 * Super Admin queries this scoped to their own institution; Master Admin queries it platform-wide.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution; // null for platform-level (Master Admin) actions

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "actor_name")
    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_role")
    private Role actorRole;

    @Column(nullable = false)
    private String action; // e.g. CREATE_STUDENT, CREATE_ADMIN, MARK_ATTENDANCE

    @Column(name = "entity_type")
    private String entityType; // e.g. STUDENT, FACULTY, ADMIN, INSTITUTION

    @Column(name = "entity_id")
    private Long entityId;

    @Column(length = 500)
    private String description;

    @Builder.Default
    private String status = "SUCCESS";
}
