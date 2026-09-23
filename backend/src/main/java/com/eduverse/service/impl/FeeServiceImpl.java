package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateFeeStructureRequest;
import com.eduverse.dto.request.RecordFeePaymentRequest;
import com.eduverse.dto.response.FeePaymentResponse;
import com.eduverse.dto.response.FeeStructureResponse;
import com.eduverse.entity.ClassSection;
import com.eduverse.entity.FeePayment;
import com.eduverse.entity.FeeStructure;
import com.eduverse.entity.Institution;
import com.eduverse.entity.PaymentStatus;
import com.eduverse.entity.StudentProfile;
import com.eduverse.entity.User;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ClassSectionRepository;
import com.eduverse.repository.FeePaymentRepository;
import com.eduverse.repository.FeeStructureRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.FeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeeServiceImpl implements FeeService {

    private final FeeStructureRepository feeStructureRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ClassSectionRepository classSectionRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public FeeStructureResponse createFeeStructure(Long institutionId, CreateFeeStructureRequest request) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        ClassSection classSection = null;
        if (request.classSectionId() != null) {
            classSection = classSectionRepository.findById(request.classSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class/Section not found"));
        }

        com.eduverse.entity.InstitutionType type = request.institutionType() != null
                ? request.institutionType()
                : (classSection != null && classSection.getInstitutionType() != null
                        ? classSection.getInstitutionType()
                        : institution.getType());

        FeeStructure feeStructure = FeeStructure.builder()
                .institution(institution)
                .institutionType(type)
                .classSection(classSection)
                .title(request.title())
                .amount(request.amount())
                .academicYear(request.academicYear())
                .dueDate(request.dueDate())
                .description(request.description())
                .build();
        feeStructure = feeStructureRepository.save(feeStructure);

        // Auto-create a pending FeePayment tracking row for every applicable student
        List<StudentProfile> targetStudents;
        if (classSection != null) {
            targetStudents = studentProfileRepository
                    .findByInstitutionIdAndClassSectionId(institutionId, classSection.getId(),
                            org.springframework.data.domain.Pageable.unpaged())
                    .getContent();
        } else {
            targetStudents = studentProfileRepository
                    .findByInstitutionId(institutionId, org.springframework.data.domain.Pageable.unpaged())
                    .getContent();
        }

        FeeStructure finalFeeStructure = feeStructure;
        for (StudentProfile student : targetStudents) {
            FeePayment payment = FeePayment.builder()
                    .institution(institution)
                    .student(student)
                    .feeStructure(finalFeeStructure)
                    .amountDue(finalFeeStructure.getAmount())
                    .amountPaid(0.0)
                    .status(PaymentStatus.PENDING)
                    .build();
            feePaymentRepository.save(payment);
        }

        auditLogService.log(institutionId, "CREATE_FEE_STRUCTURE", "FEE_STRUCTURE", feeStructure.getId(),
                "Created fee structure '" + feeStructure.getTitle() + "' (" + feeStructure.getAmount() + ") for " + targetStudents.size() + " student(s)");

        return FeeStructureResponse.from(feeStructure);
    }

    @Override
    public List<FeeStructureResponse> listFeeStructures(Long institutionId) {
        return feeStructureRepository.findByInstitutionId(institutionId).stream()
                .map(FeeStructureResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void deleteFeeStructure(Long institutionId, Long feeStructureId) {
        FeeStructure feeStructure = feeStructureRepository.findById(feeStructureId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found"));
        if (!feeStructure.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Fee structure not found in this institution");
        }
        feeStructureRepository.delete(feeStructure);
    }

    @Override
    @Transactional
    public FeePaymentResponse recordPayment(Long institutionId, Long collectedByUserId, RecordFeePaymentRequest request) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(request.studentId(), institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        FeePayment payment = feePaymentRepository
                .findByStudentIdAndFeeStructureId(student.getId(), request.feeStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found for this student"));

        if (request.amount() > (payment.getAmountDue() - payment.getAmountPaid()) + 0.01) {
            throw new BadRequestException("Payment amount exceeds the outstanding balance");
        }

        User collector = userRepository.findById(collectedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        payment.setAmountPaid(payment.getAmountPaid() + request.amount());
        payment.setLastPaymentDate(LocalDate.now());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setTransactionRef(request.transactionRef());
        payment.setCollectedBy(collector);

        if (payment.getAmountPaid() >= payment.getAmountDue()) {
            payment.setStatus(PaymentStatus.PAID);
        } else if (payment.getAmountPaid() > 0) {
            payment.setStatus(PaymentStatus.PARTIAL);
        }

        payment = feePaymentRepository.save(payment);
        auditLogService.log(institutionId, "RECORD_FEE_PAYMENT", "FEE_PAYMENT", payment.getId(),
                "Recorded payment of " + request.amount() + " for student ID " + student.getId());
        return FeePaymentResponse.from(payment);
    }

    @Override
    public Page<FeePaymentResponse> listPayments(Long institutionId, Pageable pageable) {
        return feePaymentRepository.findByInstitutionId(institutionId, pageable)
                .map(FeePaymentResponse::from);
    }

    @Override
    public List<FeePaymentResponse> getStudentFees(Long institutionId, Long studentId) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(studentId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return feePaymentRepository.findByStudentId(student.getId()).stream()
                .map(FeePaymentResponse::from)
                .toList();
    }

    @Override
    public double getTotalCollected(Long institutionId) {
        Double val = feePaymentRepository.sumAmountCollectedByInstitution(institutionId);
        return val == null ? 0.0 : val;
    }

    @Override
    public double getTotalPending(Long institutionId) {
        Double val = feePaymentRepository.sumAmountPendingByInstitution(institutionId);
        return val == null ? 0.0 : val;
    }
}
