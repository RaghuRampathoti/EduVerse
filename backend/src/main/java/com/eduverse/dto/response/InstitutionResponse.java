package com.eduverse.dto.response;

import com.eduverse.entity.Institution;
import com.eduverse.entity.InstitutionStatus;
import com.eduverse.entity.InstitutionType;

import java.time.LocalDateTime;

public record InstitutionResponse(
        Long id,
        String name,
        String code,
        InstitutionType type,
        InstitutionStatus status,
        String email,
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
        long studentCount,
        long facultyCount,
        LocalDateTime createdAt
) {
    public static InstitutionResponse from(Institution i, long studentCount, long facultyCount) {
        return new InstitutionResponse(
                i.getId(), i.getName(), i.getCode(), i.getType(), i.getStatus(),
                i.getEmail(), i.getPhone(), i.getAddress(), i.getCity(), i.getState(),
                i.getCountry(), i.getPostalCode(), i.getLogoUrl(), i.getPrimaryColor(),
                i.getEstablishedYear(), i.getMaxStudents(), studentCount, facultyCount, i.getCreatedAt()
        );
    }
}
