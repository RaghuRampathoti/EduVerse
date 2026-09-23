package com.eduverse.controller;

import com.eduverse.dto.ApiResponse;
import com.eduverse.dto.request.CreateFeeStructureRequest;
import com.eduverse.dto.request.RecordFeePaymentRequest;
import com.eduverse.dto.response.FeePaymentResponse;
import com.eduverse.dto.response.FeeStructureResponse;
import com.eduverse.security.SecurityUser;
import com.eduverse.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/fees")
@RequiredArgsConstructor
public class AdminFeeController {

    private final FeeService feeService;

    @PostMapping("/structures")
    public ResponseEntity<ApiResponse<FeeStructureResponse>> createStructure(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody CreateFeeStructureRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Fee structure created and applied to students",
                feeService.createFeeStructure(principal.getInstitutionId(), request)));
    }

    @GetMapping("/structures")
    public ResponseEntity<ApiResponse<List<FeeStructureResponse>>> listStructures(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feeService.listFeeStructures(principal.getInstitutionId())));
    }

    @DeleteMapping("/structures/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStructure(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long id
    ) {
        feeService.deleteFeeStructure(principal.getInstitutionId(), id);
        return ResponseEntity.ok(ApiResponse.message("Fee structure deleted"));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<FeePaymentResponse>> recordPayment(
            @AuthenticationPrincipal SecurityUser principal,
            @Valid @RequestBody RecordFeePaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Payment recorded",
                feeService.recordPayment(principal.getInstitutionId(), principal.getUserId(), request)));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<FeePaymentResponse>>> listPayments(
            @AuthenticationPrincipal SecurityUser principal, Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feeService.listPayments(principal.getInstitutionId(), pageable)));
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<ApiResponse<List<FeePaymentResponse>>> studentFees(
            @AuthenticationPrincipal SecurityUser principal, @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feeService.getStudentFees(principal.getInstitutionId(), studentId)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Double>>> summary(
            @AuthenticationPrincipal SecurityUser principal
    ) {
        Long institutionId = principal.getInstitutionId();
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "totalCollected", feeService.getTotalCollected(institutionId),
                "totalPending", feeService.getTotalPending(institutionId)
        )));
    }
}
