package com.eduverse.service;

import com.eduverse.dto.request.UpdateInstitutionRequest;
import com.eduverse.dto.response.InstitutionResponse;

public interface InstitutionService {
    InstitutionResponse getMyInstitution(Long institutionId);
    InstitutionResponse updateMyInstitution(Long institutionId, UpdateInstitutionRequest request);
}
