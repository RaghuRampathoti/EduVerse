package com.eduverse.repository;

import com.eduverse.entity.FeeStructure;
import com.eduverse.entity.InstitutionType;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByInstitutionId(Long institutionId);
    List<FeeStructure> findByInstitutionIdAndInstitutionType(Long institutionId, InstitutionType institutionType);
    List<FeeStructure> findByClassSectionId(Long classSectionId);

    @Modifying
    @Query("DELETE FROM FeeStructure f WHERE f.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
