package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Generic account-creation payload used by Super Admin (to create Admins)
 * and by Admin (to create Faculty/Student/Parent login accounts).
 */
public record CreateUserRequest(
                @NotBlank String fullName,
                @NotBlank @Email String email,
                String username,
                String phone,
                String password,
                InstitutionType assignedInstitutionType) {

    public CreateUserRequest(String fullName, String email, String username, String phone, String password) {
        this(fullName, email, username, phone, password, null);
    }
}
