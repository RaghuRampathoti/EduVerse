package com.eduverse.repository;
import com.eduverse.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByInstitutionIdOrderByStartDateDesc(Long institutionId);
    long countByInstitutionId(Long institutionId);

    @Modifying
    @Query("DELETE FROM Exam e WHERE e.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
