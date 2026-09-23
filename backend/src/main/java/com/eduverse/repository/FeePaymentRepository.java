package com.eduverse.repository;

import com.eduverse.entity.FeePayment;
import com.eduverse.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

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
}
