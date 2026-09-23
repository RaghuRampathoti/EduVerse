package com.eduverse.dto.response;

/**
 * Returned whenever the system auto-generates a login for a newly created user
 * (super admin, admin, faculty, student, parent), so the creator can share credentials.
 */
public record CreatedAccountResponse(
        Long userId,
        String email,
        String username,
        String temporaryPassword
) {}
