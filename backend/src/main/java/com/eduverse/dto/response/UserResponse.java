package com.eduverse.dto.response;

import com.eduverse.entity.InstitutionType;
import com.eduverse.entity.Role;
import com.eduverse.entity.User;
import com.eduverse.entity.UserStatus;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String username,
        String phone,
        Role role,
        UserStatus status,
        Long institutionId,
        String institutionName,
        String institutionCode,
        String avatarUrl,
        boolean mustChangePassword,
        InstitutionType assignedInstitutionType
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUsername(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getInstitution() != null ? user.getInstitution().getId() : null,
                user.getInstitution() != null ? user.getInstitution().getName() : null,
                user.getInstitution() != null ? user.getInstitution().getCode() : null,
                user.getAvatarUrl(),
                user.isMustChangePassword(),
                user.getAssignedInstitutionType() != null
                        ? user.getAssignedInstitutionType()
                        : (user.getInstitution() != null ? user.getInstitution().getType() : null)
        );
    }
}
