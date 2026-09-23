package com.eduverse.dto.response;

import com.eduverse.entity.FeePayment;
import com.eduverse.entity.PaymentStatus;

import java.time.LocalDate;

public record FeePaymentResponse(
        Long id,
        Long studentId,
        String studentName,
        String admissionNumber,
        Long feeStructureId,
        String feeTitle,
        Double amountDue,
        Double amountPaid,
        Double balance,
        PaymentStatus status,
        LocalDate lastPaymentDate,
        String paymentMethod,
        String transactionRef
) {
    public static FeePaymentResponse from(FeePayment p) {
        return new FeePaymentResponse(
                p.getId(),
                p.getStudent().getId(),
                p.getStudent().getUser().getFullName(),
                p.getStudent().getAdmissionNumber(),
                p.getFeeStructure().getId(),
                p.getFeeStructure().getTitle(),
                p.getAmountDue(),
                p.getAmountPaid(),
                p.getAmountDue() - p.getAmountPaid(),
                p.getStatus(),
                p.getLastPaymentDate(),
                p.getPaymentMethod(),
                p.getTransactionRef()
        );
    }
}
