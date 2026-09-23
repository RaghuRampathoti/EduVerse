package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateFacultyRequest;
import com.eduverse.dto.request.UpdateFacultyRequest;
import com.eduverse.dto.response.FacultyResponse;
import com.eduverse.entity.FacultyProfile;
import com.eduverse.entity.Institution;
import com.eduverse.entity.Role;
import com.eduverse.entity.User;
import com.eduverse.entity.UserStatus;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ClassSectionRepository;
import com.eduverse.repository.FacultyAttendanceRepository;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.TimetableRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.FacultyService;
import java.util.List;
import com.eduverse.service.PasswordGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FacultyServiceImpl implements FacultyService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final ClassSectionRepository classSectionRepository;
    private final TimetableRepository timetableRepository;
    private final FacultyAttendanceRepository facultyAttendanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public FacultyResponse create(Long institutionId, CreateFacultyRequest request) {
        if (institutionId == null) {
            throw new BadRequestException("Institution ID is required to register faculty/staff");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An account with email '" + request.email() + "' already exists");
        }

        String empId = (request.employeeId() != null && !request.employeeId().trim().isBlank())
                ? request.employeeId().trim()
                : "FAC-" + (System.currentTimeMillis() % 1000000);

        if (facultyProfileRepository.existsByInstitutionIdAndEmployeeId(institutionId, empId)) {
            empId = "FAC-" + System.currentTimeMillis();
        }

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        com.eduverse.entity.InstitutionType instType = request.institutionType() != null
                ? request.institutionType()
                : (institution != null && institution.getType() != null ? institution.getType() : com.eduverse.entity.InstitutionType.SCHOOL);

        String tempPassword = request.password() != null && !request.password().isBlank()
                ? request.password()
                : passwordGenerator.generate();
        User facultyUser = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(tempPassword))
                .fullName(request.fullName())
                .phone(request.phone())
                .role(Role.FACULTY)
                .status(UserStatus.ACTIVE)
                .institution(institution)
                .assignedInstitutionType(instType)
                .mustChangePassword(request.password() == null || request.password().isBlank())
                .build();
        facultyUser = userRepository.save(facultyUser);

        FacultyProfile faculty = FacultyProfile.builder()
                .user(facultyUser)
                .institution(institution)
                .employeeId(empId)
                .department(request.department())
                .designation(request.designation())
                .qualification(request.qualification())
                .gender(request.gender())
                .joiningDate(request.joiningDate())
                .dateOfBirth(request.dateOfBirth())
                .address(request.address())
                .monthlySalary(request.monthlySalary())
                .institutionType(instType)
                .build();
        faculty = facultyProfileRepository.save(faculty);
        auditLogService.log(institutionId, "CREATE_FACULTY", "FACULTY", faculty.getId(),
                "Registered faculty/staff member '" + facultyUser.getFullName() + "'" + (request.department() != null ? " in " + request.department() : ""));
        return FacultyResponse.from(faculty, tempPassword);
    }

    @Override
    public Page<FacultyResponse> list(Long institutionId, Pageable pageable) {
        return list(institutionId, null, pageable);
    }

    @Override
    public Page<FacultyResponse> list(Long institutionId, String institutionType, Pageable pageable) {
        if (institutionId == null) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        Page<FacultyResponse> allFaculty = facultyProfileRepository.findByInstitutionId(institutionId, pageable)
                .map(FacultyResponse::from);
        if (institutionType != null && !institutionType.isBlank() && !institutionType.equalsIgnoreCase("ALL")) {
            List<FacultyResponse> filtered = allFaculty.getContent().stream()
                    .filter(f -> f.institutionType() == null || f.institutionType().equalsIgnoreCase(institutionType))
                    .toList();
            return new org.springframework.data.domain.PageImpl<>(filtered, pageable, allFaculty.getTotalElements());
        }
        return allFaculty;
    }

    @Override
    public FacultyResponse get(Long institutionId, Long facultyId) {
        FacultyProfile faculty = facultyProfileRepository.findByIdAndInstitutionId(facultyId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        return FacultyResponse.from(faculty);
    }

    @Override
    @Transactional
    public FacultyResponse update(Long institutionId, Long facultyId, UpdateFacultyRequest request) {
        FacultyProfile faculty = facultyProfileRepository.findByIdAndInstitutionId(facultyId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        if (request.fullName() != null) faculty.getUser().setFullName(request.fullName());
        if (request.phone() != null) faculty.getUser().setPhone(request.phone());
        if (request.password() != null && !request.password().isBlank()) {
            faculty.getUser().setPassword(passwordEncoder.encode(request.password()));
            faculty.getUser().setMustChangePassword(false);
        }
        if (request.employeeId() != null && !request.employeeId().isBlank()) {
            faculty.setEmployeeId(request.employeeId());
        }
        if (request.department() != null) faculty.setDepartment(request.department());
        if (request.designation() != null) faculty.setDesignation(request.designation());
        if (request.qualification() != null) faculty.setQualification(request.qualification());
        if (request.address() != null) faculty.setAddress(request.address());
        if (request.monthlySalary() != null) faculty.setMonthlySalary(request.monthlySalary());
        if (request.institutionType() != null) faculty.setInstitutionType(request.institutionType());

        userRepository.save(faculty.getUser());
        faculty = facultyProfileRepository.save(faculty);
        return FacultyResponse.from(faculty);
    }

    @Override
    @Transactional
    public void delete(Long institutionId, Long facultyId) {
        FacultyProfile faculty = facultyProfileRepository.findByIdAndInstitutionId(facultyId, institutionId)
                .orElse(null);
        if (faculty == null) {
            return;
        }

        User user = faculty.getUser();

        try {
            List<com.eduverse.entity.ClassSection> classSections = classSectionRepository.findByClassTeacherId(facultyId);
            for (var cs : classSections) {
                cs.setClassTeacher(null);
                classSectionRepository.save(cs);
            }
        } catch (Exception ignored) {}

        try {
            timetableRepository.deleteByFacultyId(facultyId);
        } catch (Exception ignored) {}

        try {
            facultyAttendanceRepository.deleteByFacultyId(facultyId);
        } catch (Exception ignored) {}

        facultyProfileRepository.delete(faculty);
        facultyProfileRepository.flush();

        if (user != null) {
            try {
                userRepository.delete(user);
            } catch (Exception ignored) {}
        }
    }
}
