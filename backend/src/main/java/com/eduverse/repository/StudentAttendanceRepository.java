package com.eduverse.repository;

import com.eduverse.entity.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {
    List<StudentAttendance> findByClassSectionIdAndAttendanceDate(Long classSectionId, LocalDate date);
    List<StudentAttendance> findByClassSectionIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(Long classSectionId, LocalDate startDate, LocalDate endDate);
    List<StudentAttendance> findByStudentIdOrderByAttendanceDateDesc(Long studentId);
    Optional<StudentAttendance> findByStudentIdAndAttendanceDate(Long studentId, LocalDate date);
    long countByInstitutionIdAndAttendanceDateAndStatus(Long institutionId, LocalDate date, com.eduverse.entity.AttendanceStatus status);
    long countByStudentIdAndStatus(Long studentId, com.eduverse.entity.AttendanceStatus status);
    long countByStudentId(Long studentId);
    void deleteByClassSectionId(Long classSectionId);

    @Modifying
    @Query("DELETE FROM StudentAttendance s WHERE s.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

    @Modifying
    @Query("DELETE FROM StudentAttendance s WHERE s.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
