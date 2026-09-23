package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateStudentRequest;
import com.eduverse.dto.request.UpdateStudentRequest;
import com.eduverse.dto.response.StudentResponse;
import com.eduverse.entity.ClassSection;
import com.eduverse.entity.Institution;
import com.eduverse.entity.ParentProfile;
import com.eduverse.entity.Role;
import com.eduverse.entity.StudentProfile;
import com.eduverse.entity.User;
import com.eduverse.entity.UserStatus;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ClassSectionRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.ParentProfileRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.PasswordGenerator;
import com.eduverse.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentServiceImpl implements StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final ClassSectionRepository classSectionRepository;
    private final ParentProfileRepository parentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public StudentResponse create(Long institutionId, CreateStudentRequest request) {
        if (institutionId == null) {
            throw new BadRequestException("Institution ID is required to enroll a student");
        }
        if (userRepository.existsByInstitutionIdAndEmail(institutionId, request.email())) {
            throw new BadRequestException("Student email already registered in this institution");
        }
        if (request.username() != null && !request.username().isBlank()
                && userRepository.existsByInstitutionIdAndUsername(institutionId, request.username())) {
            throw new BadRequestException("Student username already registered in this institution");
        }
        if (request.admissionNumber() != null && !request.admissionNumber().isBlank()
                && studentProfileRepository.existsByInstitutionIdAndAdmissionNumber(institutionId, request.admissionNumber())) {
            throw new BadRequestException("Admission number '" + request.admissionNumber() + "' already exists in this institution");
        }

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        ClassSection classSection = null;
        if (request.classSectionId() != null) {
            classSection = classSectionRepository.findById(request.classSectionId())
                    .filter(c -> c.getInstitution() != null && c.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new ResourceNotFoundException("Class/Section not found in this institution"));
        }

        // Create student login account
        String tempPassword = (request.password() != null && !request.password().isBlank())
                ? request.password()
                : passwordGenerator.generate();

        User studentUser = User.builder()
                .email(request.email())
                .username(request.username() != null && !request.username().isBlank() ? request.username() : null)
                .password(passwordEncoder.encode(tempPassword))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .institution(institution)
                .mustChangePassword(request.password() == null || request.password().isBlank())
                .build();
        studentUser = userRepository.save(studentUser);

        com.eduverse.entity.InstitutionType type = request.institutionType() != null
                ? request.institutionType()
                : (classSection != null && classSection.getInstitutionType() != null
                        ? classSection.getInstitutionType()
                        : institution.getType());

        // Create student profile
        StudentProfile student = StudentProfile.builder()
                .user(studentUser)
                .institution(institution)
                .institutionType(type)
                .admissionNumber(request.admissionNumber())
                .classSection(classSection)
                .rollNumber(request.rollNumber())
                .gender(request.gender())
                .dateOfBirth(request.dateOfBirth())
                .admissionDate(request.admissionDate())
                .guardianName(request.guardianName())
                .guardianPhone(request.guardianPhone())
                .address(request.address())
                .bloodGroup(request.bloodGroup())
                .build();
        student = studentProfileRepository.save(student);

        // Optionally create parent account and link
        String parentEmail = null;
        String parentUsername = null;
        String parentTempPassword = null;

        if (request.parentFullName() != null && request.parentEmail() != null && !request.parentEmail().isBlank()) {
            parentEmail = request.parentEmail();
            parentUsername = request.parentUsername();
            if (request.parentUsername() != null && !request.parentUsername().isBlank()
                    && userRepository.existsByInstitutionIdAndUsername(institutionId, request.parentUsername())) {
                throw new BadRequestException("Parent username already registered in this institution");
            }

            if (!userRepository.existsByInstitutionIdAndEmail(institutionId, request.parentEmail())) {
                parentTempPassword = (request.parentPassword() != null && !request.parentPassword().isBlank())
                        ? request.parentPassword()
                        : passwordGenerator.generate();

                User parentUser = User.builder()
                        .email(request.parentEmail())
                        .username(request.parentUsername() != null && !request.parentUsername().isBlank() ? request.parentUsername() : null)
                        .password(passwordEncoder.encode(parentTempPassword))
                        .fullName(request.parentFullName())
                        .phone(request.parentPhone())
                        .role(Role.PARENT)
                        .status(UserStatus.ACTIVE)
                        .institution(institution)
                        .mustChangePassword(request.parentPassword() == null || request.parentPassword().isBlank())
                        .build();
                parentUser = userRepository.save(parentUser);

                ParentProfile parent = ParentProfile.builder()
                        .user(parentUser)
                        .institution(institution)
                        .children(java.util.Set.of(student))
                        .build();
                parentProfileRepository.save(parent);
            }
        }

        auditLogService.log(institutionId, "CREATE_STUDENT", "STUDENT", student.getId(),
                "Enrolled student '" + studentUser.getFullName() + "'" + (classSection != null ? " into " + classSection.getClassName() + "-" + classSection.getSectionName() : ""));

        return StudentResponse.from(student, tempPassword, parentEmail, parentUsername, parentTempPassword);
    }

    @Override
    public Page<StudentResponse> list(Long institutionId, Pageable pageable) {
        if (institutionId == null) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        return studentProfileRepository.findByInstitutionId(institutionId, pageable)
                .map(StudentResponse::from);
    }

    @Override
    public Page<StudentResponse> listByClass(Long institutionId, Long classSectionId, Pageable pageable) {
        if (institutionId == null) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        return studentProfileRepository.findByInstitutionIdAndClassSectionId(institutionId, classSectionId, pageable)
                .map(StudentResponse::from);
    }

    @Override
    public StudentResponse get(Long institutionId, Long studentId) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(studentId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return StudentResponse.from(student);
    }

    @Override
    @Transactional   
    public StudentResponse update(Long institutionId, Long studentId, UpdateStudentRequest request) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(studentId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (request.fullName() != null) student.getUser().setFullName(request.fullName());
        if (request.phone() != null) student.getUser().setPhone(request.phone());
        if (request.classSectionId() != null) {
            ClassSection sec = classSectionRepository.findById(request.classSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class/Section not found"));
            student.setClassSection(sec);
        }
        if (request.rollNumber() != null) student.setRollNumber(request.rollNumber());
        if (request.gender() != null) student.setGender(request.gender());
        if (request.dateOfBirth() != null) student.setDateOfBirth(request.dateOfBirth());
        if (request.guardianName() != null) student.setGuardianName(request.guardianName());
        if (request.guardianPhone() != null) student.setGuardianPhone(request.guardianPhone());
        if (request.address() != null) student.setAddress(request.address());
        if (request.bloodGroup() != null) student.setBloodGroup(request.bloodGroup());

        userRepository.save(student.getUser());
        student = studentProfileRepository.save(student);

        String parentEmail = null;
        String parentUsername = null;
        String parentTempPassword = null;
        String parentFullName = null;
        String parentPhone = null;

        java.util.Optional<ParentProfile> existingParentOpt = parentProfileRepository.findByChildren_Id(studentId);
        if (existingParentOpt.isPresent()) {
            ParentProfile parentProfile = existingParentOpt.get();
            User parentUser = parentProfile.getUser();

            if (request.parentFullName() != null && !request.parentFullName().isBlank()) {
                parentUser.setFullName(request.parentFullName());
            }
            if (request.parentEmail() != null && !request.parentEmail().isBlank()) {
                parentUser.setEmail(request.parentEmail());
            }
            if (request.parentUsername() != null && !request.parentUsername().isBlank()) {
                parentUser.setUsername(request.parentUsername());
            }
            if (request.parentPhone() != null && !request.parentPhone().isBlank()) {
                parentUser.setPhone(request.parentPhone());
            }
            if (request.parentPassword() != null && !request.parentPassword().isBlank()) {
                parentUser.setPassword(passwordEncoder.encode(request.parentPassword()));
                parentTempPassword = request.parentPassword();
            }

            userRepository.save(parentUser);
            parentEmail = parentUser.getEmail();
            parentUsername = parentUser.getUsername();
            parentFullName = parentUser.getFullName();
            parentPhone = parentUser.getPhone();
        } else if (request.parentEmail() != null && !request.parentEmail().isBlank()) {
            parentEmail = request.parentEmail();
            parentUsername = request.parentUsername();
            parentFullName = request.parentFullName() != null ? request.parentFullName() : request.guardianName();
            parentPhone = request.parentPhone() != null ? request.parentPhone() : request.guardianPhone();

            if (!userRepository.existsByEmail(request.parentEmail())) {
                parentTempPassword = (request.parentPassword() != null && !request.parentPassword().isBlank())
                        ? request.parentPassword()
                        : passwordGenerator.generate();

                User parentUser = User.builder()
                        .email(request.parentEmail())
                        .username(request.parentUsername() != null && !request.parentUsername().isBlank() ? request.parentUsername() : null)
                        .password(passwordEncoder.encode(parentTempPassword))
                        .fullName(parentFullName)
                        .phone(parentPhone)
                        .role(Role.PARENT)
                        .status(UserStatus.ACTIVE)
                        .institution(student.getInstitution())
                        .mustChangePassword(request.parentPassword() == null || request.parentPassword().isBlank())
                        .build();
                parentUser = userRepository.save(parentUser);

                ParentProfile parent = ParentProfile.builder()
                        .user(parentUser)
                        .institution(student.getInstitution())
                        .children(java.util.Set.of(student))
                        .build();
                parentProfileRepository.save(parent);
            }
        }

        return StudentResponse.from(student, null, parentEmail, parentUsername, parentTempPassword, parentFullName, parentPhone);
    }

    @Override
    @Transactional
    public void delete(Long institutionId, Long studentId) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(studentId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        userRepository.delete(student.getUser());
        studentProfileRepository.delete(student);
    }
}
