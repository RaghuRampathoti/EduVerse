package com.eduverse.repository;

import com.eduverse.entity.ClassSection;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClassSectionRepository extends JpaRepository<ClassSection, Long> {
    List<ClassSection> findByInstitutionId(Long institutionId);
    List<ClassSection> findByClassTeacherId(Long classTeacherId);

    @Modifying
    @Query("DELETE FROM ClassSection c WHERE c.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
