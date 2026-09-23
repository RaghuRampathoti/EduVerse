package com.eduverse.dto.response;

public record InstitutionCreatedResponse(
        InstitutionResponse institution,
        CreatedAccountResponse superAdminAccount
) {}
