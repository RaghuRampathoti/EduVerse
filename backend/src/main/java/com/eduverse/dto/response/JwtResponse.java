package com.eduverse.dto.response;

public record JwtResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        UserResponse user
) {
    public static JwtResponse of(String accessToken, String refreshToken, UserResponse user) {
        return new JwtResponse(accessToken, refreshToken, "Bearer", user);
    }
}
