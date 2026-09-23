package com.eduverse.service;

import com.eduverse.dto.request.ChangePasswordRequest;
import com.eduverse.dto.request.LoginRequest;
import com.eduverse.dto.response.JwtResponse;
import com.eduverse.dto.response.UserResponse;

public interface AuthService {
    JwtResponse login(LoginRequest request);
    JwtResponse refreshToken(String refreshToken);
    UserResponse getCurrentUser(Long userId);
    void changePassword(Long userId, ChangePasswordRequest request);
}
