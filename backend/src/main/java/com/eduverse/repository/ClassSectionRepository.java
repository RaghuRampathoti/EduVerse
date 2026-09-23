package com.eduverse.repository;

import com.eduverse.entity.ClassSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassSectionRepository extends JpaRepository<ClassSection, Long> {
    List<ClassSection> findByInstitutionId(Long institutionId);
    List<ClassSection> findByClassTeacherId(Long classTeacherId);
}
