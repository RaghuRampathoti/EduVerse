package com.eduverse.repository;

import com.eduverse.entity.ParentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentProfileRepository extends JpaRepository<ParentProfile, Long> {
    Optional<ParentProfile> findByUserId(Long userId);
    Optional<ParentProfile> findByIdAndInstitutionId(Long id, Long institutionId);
    Optional<ParentProfile> findByChildren_Id(Long studentId);
}
