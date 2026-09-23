package com.eduverse.dto.request;

import com.eduverse.entity.InstitutionStatus;
import com.eduverse.entity.InstitutionType;

public record UpdateInstitutionRequest(
        String name,
        String code,
        InstitutionType type,
        String phone,
        String address,
        String city,
        String state,
        String country,
        String postalCode,
        String logoUrl,
        String primaryColor,
        Integer establishedYear,
        Integer maxStudents,
        InstitutionStatus status
) {}
