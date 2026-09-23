package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateUserRequest;
import com.eduverse.dto.response.CreatedAccountResponse;
import com.eduverse.dto.response.UserResponse;
import com.eduverse.entity.Institution;
import com.eduverse.entity.Role;
import com.eduverse.entity.User;
import com.eduverse.entity.UserStatus;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.AdminAccountService;
import com.eduverse.service.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAccountServiceImpl implements AdminAccountService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public CreatedAccountResponse createAdmin(Long institutionId, CreateUserRequest request) {
        if (institutionId == null) {
            throw new BadRequestException("Institution ID is required to create an admin account");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An account with email '" + request.email() + "' already exists");
        }
        if (request.username() != null && !request.username().isBlank()
                && userRepository.findByUsername(request.username()).isPresent()) {
            throw new BadRequestException("An account with username '" + request.username() + "' already exists");
        }
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        String rawPassword = (request.password() != null && !request.password().isBlank())
                ? request.password()
                : passwordGenerator.generate();

        User admin = User.builder()
                .email(request.email())
                .username(request.username() != null && !request.username().isBlank() ? request.username() : null)
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .institution(institution)
                .assignedInstitutionType(request.assignedInstitutionType() != null ? request.assignedInstitutionType() : institution.getType())
                .mustChangePassword(request.password() == null || request.password().isBlank())
                .build();
        admin = userRepository.save(admin);
        auditLogService.log(institutionId, "CREATE_ADMIN", "USER", admin.getId(),
                "Super Admin created Admin account for '" + admin.getFullName() + "' (" + admin.getEmail() + ")");
        return new CreatedAccountResponse(admin.getId(), admin.getEmail(), admin.getUsername(), rawPassword);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> listAdmins(Long institutionId) {
        if (institutionId == null) {
            return userRepository.findByRole(Role.ADMIN).stream()
                    .map(UserResponse::from)
                    .toList();
        }
        return userRepository.findByInstitutionIdAndRole(institutionId, Role.ADMIN, Pageable.unpaged())
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateAdminStatus(Long institutionId, Long adminUserId, UserStatus status) {
        User admin = findAdmin(institutionId, adminUserId);
        admin.setStatus(status);
        admin = userRepository.save(admin);
        return UserResponse.from(admin);
    }

    @Override
    @Transactional
    public void deleteAdmin(Long institutionId, Long adminUserId) {
        User admin = findAdmin(institutionId, adminUserId);
        userRepository.delete(admin);
    }

    @Override
    @Transactional
    public CreatedAccountResponse resetAdminPassword(Long institutionId, Long adminUserId) {
        User admin = findAdmin(institutionId, adminUserId);
        String tempPassword = passwordGenerator.generate();
        admin.setPassword(passwordEncoder.encode(tempPassword));
        admin.setMustChangePassword(true);
        userRepository.save(admin);
        return new CreatedAccountResponse(admin.getId(), admin.getEmail(), admin.getUsername(), tempPassword);
    }

    private User findAdmin(Long institutionId, Long adminUserId) {
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
        if (admin.getRole() != Role.ADMIN) {
            throw new ResourceNotFoundException("Admin account not found");
        }
        if (institutionId != null && admin.getInstitution() != null && !admin.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Admin account not found in this institution");
        }
        return admin;
    }
}
