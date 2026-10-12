package com.eduverse.repository;

import com.eduverse.entity.FeePayment;
import com.eduverse.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    Page<FeePayment> findByInstitutionId(Long institutionId, Pageable pageable);
    List<FeePayment> findByStudentId(Long studentId);
    Optional<FeePayment> findByStudentIdAndFeeStructureId(Long studentId, Long feeStructureId);
    List<FeePayment> findByInstitutionIdAndStatus(Long institutionId, PaymentStatus status);
    long countByInstitutionIdAndStatus(Long institutionId, PaymentStatus status);

    @org.springframework.data.jpa.repository.Query(
        "select coalesce(sum(f.amountPaid), 0) from FeePayment f where f.institution.id = :institutionId")
    Double sumAmountCollectedByInstitution(Long institutionId);

    @org.springframework.data.jpa.repository.Query(
        "select coalesce(sum(f.amountDue - f.amountPaid), 0) from FeePayment f where f.institution.id = :institutionId")
    Double sumAmountPendingByInstitution(Long institutionId);

    @Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM FeePayment f WHERE f.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

    @Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM FeePayment f WHERE f.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
