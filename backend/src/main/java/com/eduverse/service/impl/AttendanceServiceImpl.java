package com.eduverse.service.impl;

import com.eduverse.dto.request.MarkFacultyAttendanceRequest;
import com.eduverse.dto.request.MarkStudentAttendanceRequest;
import com.eduverse.dto.response.AttendanceSummaryResponse;
import com.eduverse.dto.response.FacultyAttendanceResponse;
import com.eduverse.dto.response.StudentAttendanceResponse;
import com.eduverse.entity.AttendanceStatus;
import com.eduverse.entity.FacultyAttendance;
import com.eduverse.entity.FacultyProfile;
import com.eduverse.entity.Institution;
import com.eduverse.entity.StudentAttendance;
import com.eduverse.entity.StudentProfile;
import com.eduverse.entity.User;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.FacultyAttendanceRepository;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.StudentAttendanceRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceServiceImpl implements AttendanceService {

    private final StudentAttendanceRepository studentAttendanceRepository;
    private final FacultyAttendanceRepository facultyAttendanceRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public List<StudentAttendanceResponse> markStudentAttendance(Long institutionId, Long userId,
                                                                  MarkStudentAttendanceRequest request) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
        User marker = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<StudentAttendance> attendances = request.entries().stream()
                .map(entry -> {
                    StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(entry.studentId(), institutionId)
                            .orElseThrow(() -> new BadRequestException("Student not found: " + entry.studentId()));

                    StudentAttendance existing = studentAttendanceRepository
                            .findByStudentIdAndAttendanceDate(student.getId(), request.date())
                            .orElse(null);

                    StudentAttendance attendance = existing != null ? existing : StudentAttendance.builder()
                            .institution(institution)
                            .student(student)
                            .classSection(student.getClassSection())
                            .attendanceDate(request.date())
                            .build();

                    attendance.setStatus(entry.status());
                    attendance.setRemarks(entry.remarks());
                    attendance.setMarkedBy(marker);
                    return studentAttendanceRepository.save(attendance);
                })
                .toList();

        auditLogService.log(institutionId, "MARK_ATTENDANCE", "STUDENT_ATTENDANCE", null,
                "Marked attendance for " + attendances.size() + " student(s) on " + request.date());

        return attendances.stream().map(StudentAttendanceResponse::from).toList();
    }

    @Override
    public List<StudentAttendanceResponse> getStudentAttendance(Long institutionId, Long studentId) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(studentId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return studentAttendanceRepository.findByStudentIdOrderByAttendanceDateDesc(student.getId())
                .stream().map(StudentAttendanceResponse::from).toList();
    }

    @Override
    public AttendanceSummaryResponse getStudentAttendanceSummary(Long institutionId, Long studentId) {
        StudentProfile student = studentProfileRepository.findByIdAndInstitutionId(studentId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        long totalDays = studentAttendanceRepository.countByStudentId(student.getId());
        long present = studentAttendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        long absent = studentAttendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.ABSENT);
        long late = studentAttendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.LATE);
        long onLeave = studentAttendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.ON_LEAVE);

        double percentage = totalDays > 0 ? ((double) present / totalDays) * 100 : 0;
        return new AttendanceSummaryResponse(totalDays, present, absent, late, onLeave, percentage);
    }

    @Override
    @Transactional
    public FacultyAttendanceResponse markFacultyAttendance(Long institutionId, Long userId,
                                                            MarkFacultyAttendanceRequest request) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
        User marker = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FacultyProfile faculty = facultyProfileRepository.findByIdAndInstitutionId(request.facultyId(), institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        FacultyAttendance existing = facultyAttendanceRepository
                .findByFacultyIdAndAttendanceDate(faculty.getId(), request.date())
                .orElse(null);

        FacultyAttendance attendance = existing != null ? existing : FacultyAttendance.builder()
                .institution(institution)
                .faculty(faculty)
                .attendanceDate(request.date())
                .build();

        attendance.setStatus(request.status());
        attendance.setRemarks(request.remarks());
        attendance.setMarkedBy(marker);
        attendance = facultyAttendanceRepository.save(attendance);
        auditLogService.log(institutionId, "MARK_FACULTY_ATTENDANCE", "FACULTY_ATTENDANCE", attendance.getId(),
                "Marked attendance (" + attendance.getStatus() + ") for faculty ID " + faculty.getId() + " on " + request.date());
        return FacultyAttendanceResponse.from(attendance);
    }

    @Override
    public List<FacultyAttendanceResponse> getFacultyAttendance(Long institutionId, Long facultyId) {
        FacultyProfile faculty = facultyProfileRepository.findByIdAndInstitutionId(facultyId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        return facultyAttendanceRepository.findByFacultyIdOrderByAttendanceDateDesc(faculty.getId())
                .stream().map(FacultyAttendanceResponse::from).toList();
    }

    @Override
    public AttendanceSummaryResponse getFacultyAttendanceSummary(Long institutionId, Long facultyId) {
        FacultyProfile faculty = facultyProfileRepository.findByIdAndInstitutionId(facultyId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        long totalDays = facultyAttendanceRepository.countByFacultyId(faculty.getId());
        long present = facultyAttendanceRepository.countByFacultyIdAndStatus(faculty.getId(), AttendanceStatus.PRESENT);
        long absent = facultyAttendanceRepository.countByFacultyIdAndStatus(faculty.getId(), AttendanceStatus.ABSENT);
        long late = facultyAttendanceRepository.countByFacultyIdAndStatus(faculty.getId(), AttendanceStatus.LATE);
        long onLeave = facultyAttendanceRepository.countByFacultyIdAndStatus(faculty.getId(), AttendanceStatus.ON_LEAVE);

        double percentage = totalDays > 0 ? ((double) present / totalDays) * 100 : 0;
        return new AttendanceSummaryResponse(totalDays, present, absent, late, onLeave, percentage);
    }

    @Override
    public Page<StudentAttendanceResponse> listStudentAttendanceByClass(Long institutionId, Long classSectionId,
                                                                         LocalDate date, Pageable pageable) {
        List<StudentAttendance> attendances = studentAttendanceRepository
                .findByClassSectionIdAndAttendanceDate(classSectionId, date);
        return new PageImpl<>(
                attendances.stream().map(StudentAttendanceResponse::from).toList(),
                pageable,
                attendances.size()
        );
    }

    @Override
    public Page<StudentAttendanceResponse> listStudentAttendanceByClassAndDateRange(Long institutionId, Long classSectionId,
                                                                         LocalDate startDate, LocalDate endDate, Pageable pageable) {
        List<StudentAttendance> attendances = studentAttendanceRepository
                .findByClassSectionIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(classSectionId, startDate, endDate);
        return new PageImpl<>(
                attendances.stream().map(StudentAttendanceResponse::from).toList(),
                pageable,
                attendances.size()
        );
    }

    @Override
    public Page<FacultyAttendanceResponse> listInstitutionAttendance(Long institutionId, LocalDate date,
                                                                      Pageable pageable) {
        List<FacultyAttendance> attendances = facultyAttendanceRepository
                .findByInstitutionIdAndAttendanceDate(institutionId, date);
        return new PageImpl<>(
                attendances.stream().map(FacultyAttendanceResponse::from).toList(),
                pageable,
                attendances.size()
        );
    }
}
