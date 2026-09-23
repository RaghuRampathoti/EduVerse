package com.eduverse.repository;
import com.eduverse.entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    long countByInstitutionId(Long institutionId);
}
