package com.eduverse.service;

import com.eduverse.dto.request.CreateUserRequest;
import com.eduverse.dto.response.CreatedAccountResponse;
import com.eduverse.dto.response.UserResponse;
import com.eduverse.entity.UserStatus;

import java.util.List;

/**
 * Used by SUPER_ADMIN to manage ADMIN role accounts within their own institution.
 */
public interface AdminAccountService {
    CreatedAccountResponse createAdmin(Long institutionId, CreateUserRequest request);
    List<UserResponse> listAdmins(Long institutionId);
    UserResponse updateAdminStatus(Long institutionId, Long adminUserId, UserStatus status);
    void deleteAdmin(Long institutionId, Long adminUserId);
    CreatedAccountResponse resetAdminPassword(Long institutionId, Long adminUserId);
}
