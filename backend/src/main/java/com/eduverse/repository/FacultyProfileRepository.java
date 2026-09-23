package com.eduverse.repository;

import com.eduverse.entity.FacultyProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    Optional<FacultyProfile> findByUserId(Long userId);
    Optional<FacultyProfile> findByIdAndInstitutionId(Long id, Long institutionId);
    Page<FacultyProfile> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<FacultyProfile> findByInstitutionIdAndInstitutionType(Long institutionId, com.eduverse.entity.InstitutionType institutionType, Pageable pageable);
    long countByInstitutionId(Long institutionId);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByInstitutionIdAndEmployeeId(Long institutionId, String employeeId);
}
