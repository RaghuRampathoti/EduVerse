package com.eduverse.repository;
import com.eduverse.entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    long countByInstitutionId(Long institutionId);

    @Modifying
    @Query("DELETE FROM Homework h WHERE h.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
