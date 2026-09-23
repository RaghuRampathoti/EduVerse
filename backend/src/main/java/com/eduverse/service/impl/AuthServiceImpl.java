package com.eduverse.service.impl;

import com.eduverse.dto.request.ChangePasswordRequest;
import com.eduverse.dto.request.LoginRequest;
import com.eduverse.dto.response.JwtResponse;
import com.eduverse.dto.response.UserResponse;
import com.eduverse.entity.User;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.UserRepository;
import com.eduverse.security.JwtService;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public JwtResponse login(LoginRequest request) {
        String identifier = request.getIdentifier();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.password())
        );

        User user = userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        SecurityUser securityUser = new SecurityUser(user);
        String accessToken = jwtService.generateAccessToken(securityUser);
        String refreshToken = jwtService.generateRefreshToken(securityUser);

        return JwtResponse.of(accessToken, refreshToken, UserResponse.from(user));
    }

    @Override
    public JwtResponse refreshToken(String refreshToken) {
        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        SecurityUser securityUser = new SecurityUser(user);
        if (!jwtService.isTokenValid(refreshToken, email)) {
            throw new BadRequestException("Refresh token is invalid or expired. Please log in again.");
        }
        String newAccessToken = jwtService.generateAccessToken(securityUser);
        String newRefreshToken = jwtService.generateRefreshToken(securityUser);
        return JwtResponse.of(newAccessToken, newRefreshToken, UserResponse.from(user));
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return UserResponse.from(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }
}
