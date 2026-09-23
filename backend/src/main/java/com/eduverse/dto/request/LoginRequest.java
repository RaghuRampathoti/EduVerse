package com.eduverse.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        String username,
        String email,
        @NotBlank String password
) {
    public String getIdentifier() {
        if (username != null && !username.isBlank()) {
            return username;
        }
        return email;
    }
}
