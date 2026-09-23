package com.eduverse.repository;

import com.eduverse.entity.InstitutionType;
import com.eduverse.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByIdAndInstitutionId(Long id, Long institutionId);
    Page<StudentProfile> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<StudentProfile> findByInstitutionIdAndInstitutionType(Long institutionId, InstitutionType institutionType, Pageable pageable);
    java.util.List<StudentProfile> findByClassSectionId(Long classSectionId);
    Page<StudentProfile> findByInstitutionIdAndClassSectionId(Long institutionId, Long classSectionId, Pageable pageable);
    long countByInstitutionId(Long institutionId);
    boolean existsByAdmissionNumber(String admissionNumber);
    boolean existsByInstitutionIdAndAdmissionNumber(Long institutionId, String admissionNumber);
}
