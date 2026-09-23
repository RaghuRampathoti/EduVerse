package com.eduverse.repository;
import com.eduverse.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByInstitutionIdOrderByStartDateDesc(Long institutionId);
    long countByInstitutionId(Long institutionId);
}
