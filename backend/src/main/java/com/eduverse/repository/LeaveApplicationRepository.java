package com.eduverse.repository;
import com.eduverse.entity.LeaveApplication;
import com.eduverse.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<LeaveApplication> findByInstitutionIdAndStatus(Long institutionId, LeaveStatus status);
    long countByInstitutionIdAndStatus(Long institutionId, LeaveStatus status);
    Optional<LeaveApplication> findByIdAndInstitutionId(Long id, Long institutionId);
}
