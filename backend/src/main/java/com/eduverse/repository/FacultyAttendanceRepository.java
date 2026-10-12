package com.eduverse.repository;

import com.eduverse.entity.FacultyAttendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FacultyAttendanceRepository extends JpaRepository<FacultyAttendance, Long> {
    List<FacultyAttendance> findByInstitutionIdAndAttendanceDate(Long institutionId, LocalDate date);
    List<FacultyAttendance> findByFacultyIdOrderByAttendanceDateDesc(Long facultyId);
    Optional<FacultyAttendance> findByFacultyIdAndAttendanceDate(Long facultyId, LocalDate date);
    long countByFacultyIdAndStatus(Long facultyId, com.eduverse.entity.AttendanceStatus status);
    long countByFacultyId(Long facultyId);
    void deleteByFacultyId(Long facultyId);

    @Modifying
    @Query("DELETE FROM FacultyAttendance f WHERE f.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
