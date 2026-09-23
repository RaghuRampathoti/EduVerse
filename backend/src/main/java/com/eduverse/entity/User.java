package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * A single login-capable account. Role determines behaviour across the app.
 * institution is null ONLY for MASTER_ADMIN; every other role is tenant-scoped.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = "password")
@Entity
@Table(name = "app_users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"institution_id", "email"}),
        @UniqueConstraint(columnNames = {"institution_id", "username"})
})
public class User extends BaseEntity {

    @Column(nullable = false)
    private String email;

    @Column
    private String username;

    @Column(nullable = false)
    private String password; // BCrypt hashed

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution; // null for MASTER_ADMIN

    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_institution_type")
    private InstitutionType assignedInstitutionType;

    private String avatarUrl;

    @Column(name = "must_change_password")
    @Builder.Default
    private boolean mustChangePassword = false;

    @Column(name = "last_login_at")
    private java.time.LocalDateTime lastLoginAt;
}
