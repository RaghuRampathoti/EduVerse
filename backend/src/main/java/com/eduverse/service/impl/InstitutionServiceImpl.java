package com.eduverse.service.impl;

import com.eduverse.dto.request.UpdateInstitutionRequest;
import com.eduverse.dto.response.InstitutionResponse;
import com.eduverse.entity.Institution;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    @Override
    public InstitutionResponse getMyInstitution(Long institutionId) {
        Institution institution = find(institutionId);
        return toResponse(institution);
    }

    @Override
    @Transactional
    public InstitutionResponse updateMyInstitution(Long institutionId, UpdateInstitutionRequest request) {
        Institution institution = find(institutionId);

        if (request.name() != null) institution.setName(request.name());
        if (request.phone() != null) institution.setPhone(request.phone());
        if (request.address() != null) institution.setAddress(request.address());
        if (request.city() != null) institution.setCity(request.city());
        if (request.state() != null) institution.setState(request.state());
        if (request.country() != null) institution.setCountry(request.country());
        if (request.postalCode() != null) institution.setPostalCode(request.postalCode());
        if (request.logoUrl() != null) institution.setLogoUrl(request.logoUrl());
        if (request.primaryColor() != null) institution.setPrimaryColor(request.primaryColor());
        // Note: status is intentionally NOT editable here - only Master Admin can suspend/reactivate

        institution = institutionRepository.save(institution);
        return toResponse(institution);
    }

    private Institution find(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("No institution associated with this account");
        }
        return institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
    }

    private InstitutionResponse toResponse(Institution institution) {
        long students = studentProfileRepository.countByInstitutionId(institution.getId());
        long faculty = facultyProfileRepository.countByInstitutionId(institution.getId());
        return InstitutionResponse.from(institution, students, faculty);
    }
}
