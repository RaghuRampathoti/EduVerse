package com.eduverse.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RecordFeePaymentRequest(
        @NotNull Long studentId,
        @NotNull Long feeStructureId,
        @NotNull @Positive Double amount,
        String paymentMethod,
        String transactionRef
) {}
