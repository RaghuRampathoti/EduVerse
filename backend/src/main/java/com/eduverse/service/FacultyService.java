package com.eduverse.service;

import com.eduverse.dto.request.CreateFacultyRequest;
import com.eduverse.dto.request.UpdateFacultyRequest;
import com.eduverse.dto.response.FacultyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FacultyService {
    FacultyResponse create(Long institutionId, CreateFacultyRequest request);
    Page<FacultyResponse> list(Long institutionId, Pageable pageable);
    Page<FacultyResponse> list(Long institutionId, String institutionType, Pageable pageable);
    FacultyResponse get(Long institutionId, Long facultyId);
    FacultyResponse update(Long institutionId, Long facultyId, UpdateFacultyRequest request);
    void delete(Long institutionId, Long facultyId);
}
