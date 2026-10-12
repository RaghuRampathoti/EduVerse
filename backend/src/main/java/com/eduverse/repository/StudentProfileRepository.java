package com.eduverse.repository;

import com.eduverse.entity.InstitutionType;
import com.eduverse.entity.StudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    @Query("SELECT s FROM StudentProfile s LEFT JOIN FETCH s.user LEFT JOIN FETCH s.classSection LEFT JOIN FETCH s.institution WHERE s.user.id = :userId")
    Optional<StudentProfile> findByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM StudentProfile s LEFT JOIN FETCH s.user LEFT JOIN FETCH s.classSection LEFT JOIN FETCH s.institution WHERE s.id = :id AND s.institution.id = :institutionId")
    Optional<StudentProfile> findByIdAndInstitutionId(@Param("id") Long id, @Param("institutionId") Long institutionId);

    Page<StudentProfile> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<StudentProfile> findByInstitutionIdAndInstitutionType(Long institutionId, InstitutionType institutionType, Pageable pageable);
    java.util.List<StudentProfile> findByClassSectionId(Long classSectionId);
    Page<StudentProfile> findByInstitutionIdAndClassSectionId(Long institutionId, Long classSectionId, Pageable pageable);
    long countByInstitutionId(Long institutionId);
    boolean existsByAdmissionNumber(String admissionNumber);
    boolean existsByInstitutionIdAndAdmissionNumber(Long institutionId, String admissionNumber);

    @Modifying
    @Query("DELETE FROM StudentProfile s WHERE s.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
