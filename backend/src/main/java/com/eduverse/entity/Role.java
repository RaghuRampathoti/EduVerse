package com.eduverse.entity;

/**
 * System-wide roles. MASTER_ADMIN operates above all institutions.
 * All other roles are scoped to a single Institution.
 */
public enum Role {
    MASTER_ADMIN,
    SUPER_ADMIN,
    ADMIN,
    FACULTY,
    STUDENT,
    PARENT
}
