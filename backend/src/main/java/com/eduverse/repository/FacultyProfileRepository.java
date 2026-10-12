package com.eduverse.repository;

import com.eduverse.entity.FacultyProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    @Query("SELECT f FROM FacultyProfile f LEFT JOIN FETCH f.user LEFT JOIN FETCH f.institution WHERE f.user.id = :userId")
    Optional<FacultyProfile> findByUserId(@Param("userId") Long userId);

    @Query("SELECT f FROM FacultyProfile f LEFT JOIN FETCH f.user LEFT JOIN FETCH f.institution WHERE f.id = :id AND f.institution.id = :institutionId")
    Optional<FacultyProfile> findByIdAndInstitutionId(@Param("id") Long id, @Param("institutionId") Long institutionId);

    Page<FacultyProfile> findByInstitutionId(Long institutionId, Pageable pageable);
    Page<FacultyProfile> findByInstitutionIdAndInstitutionType(Long institutionId, com.eduverse.entity.InstitutionType institutionType, Pageable pageable);
    long countByInstitutionId(Long institutionId);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByInstitutionIdAndEmployeeId(Long institutionId, String employeeId);

    @Modifying
    @Query("DELETE FROM FacultyProfile f WHERE f.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
