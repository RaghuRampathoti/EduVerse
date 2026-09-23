package com.eduverse.service;

import com.eduverse.dto.request.CreateFeeStructureRequest;
import com.eduverse.dto.request.RecordFeePaymentRequest;
import com.eduverse.dto.response.FeePaymentResponse;
import com.eduverse.dto.response.FeeStructureResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FeeService {
    FeeStructureResponse createFeeStructure(Long institutionId, CreateFeeStructureRequest request);
    List<FeeStructureResponse> listFeeStructures(Long institutionId);
    void deleteFeeStructure(Long institutionId, Long feeStructureId);

    FeePaymentResponse recordPayment(Long institutionId, Long collectedByUserId, RecordFeePaymentRequest request);
    Page<FeePaymentResponse> listPayments(Long institutionId, Pageable pageable);
    List<FeePaymentResponse> getStudentFees(Long institutionId, Long studentId);

    double getTotalCollected(Long institutionId);
    double getTotalPending(Long institutionId);
}
