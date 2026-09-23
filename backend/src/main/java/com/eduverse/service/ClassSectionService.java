package com.eduverse.service;

import com.eduverse.dto.request.CreateClassSectionRequest;
import com.eduverse.dto.response.ClassSectionResponse;

import java.util.List;

public interface ClassSectionService {
    ClassSectionResponse create(Long institutionId, CreateClassSectionRequest request);
    List<ClassSectionResponse> list(Long institutionId);
    ClassSectionResponse update(Long institutionId, Long id, CreateClassSectionRequest request);
    void delete(Long institutionId, Long id);
}
