package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.ChangePasswordRequest;
import com.eduverse.dto.request.LoginRequest;
import com.eduverse.dto.response.JwtResponse;
import com.eduverse.dto.response.UserResponse;
import com.eduverse.exception.UnauthorizedException;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refresh(@RequestBody java.util.Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        return ResponseEntity.ok(ApiResponse.ok(authService.refreshToken(refreshToken)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal SecurityUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser(principal.getUserId())));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (principal == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        authService.changePassword(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.message("Password updated successfully"));
    }
}
