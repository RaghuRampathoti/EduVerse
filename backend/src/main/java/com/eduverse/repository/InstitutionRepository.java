package com.eduverse.repository;

import com.eduverse.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    Optional<Institution> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByEmail(String email);
}
