package com.eduverse.dto.response;

import com.eduverse.entity.UserStatus;

public record SuperAdminResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        UserStatus status,
        Long institutionId,
        String institutionName,
        String institutionCode,
        String institutionType
) {}
