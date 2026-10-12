package com.eduverse.repository;

import com.eduverse.entity.ParentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ParentProfileRepository extends JpaRepository<ParentProfile, Long> {
    @Query("SELECT DISTINCT p FROM ParentProfile p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.institution LEFT JOIN FETCH p.children c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.classSection LEFT JOIN FETCH c.institution WHERE p.user.id = :userId")
    Optional<ParentProfile> findByUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT p FROM ParentProfile p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.institution LEFT JOIN FETCH p.children c LEFT JOIN FETCH c.user LEFT JOIN FETCH c.classSection LEFT JOIN FETCH c.institution WHERE p.id = :id AND p.institution.id = :institutionId")
    Optional<ParentProfile> findByIdAndInstitutionId(@Param("id") Long id, @Param("institutionId") Long institutionId);

    Optional<ParentProfile> findByChildren_Id(Long studentId);

    @Modifying
    @Query("DELETE FROM ParentProfile p WHERE p.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
