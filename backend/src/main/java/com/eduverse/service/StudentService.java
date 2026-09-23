package com.eduverse.service;

import com.eduverse.dto.request.CreateStudentRequest;
import com.eduverse.dto.request.UpdateStudentRequest;
import com.eduverse.dto.response.StudentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentService {
    StudentResponse create(Long institutionId, CreateStudentRequest request);
    Page<StudentResponse> list(Long institutionId, Pageable pageable);
    Page<StudentResponse> listByClass(Long institutionId, Long classSectionId, Pageable pageable);
    StudentResponse get(Long institutionId, Long studentId);
    StudentResponse update(Long institutionId, Long studentId, UpdateStudentRequest request);
    void delete(Long institutionId, Long studentId);
}
