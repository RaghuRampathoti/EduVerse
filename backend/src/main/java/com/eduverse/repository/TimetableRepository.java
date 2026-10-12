package com.eduverse.repository;

import com.eduverse.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByClassSectionId(Long classSectionId);
    List<Timetable> findByInstitutionIdAndClassSectionId(Long institutionId, Long classSectionId);
    List<Timetable> findByFacultyId(Long facultyId);
    Optional<Timetable> findByClassSectionIdAndDayOfWeekAndPeriodNumber(Long classSectionId, String dayOfWeek, Integer periodNumber);
    void deleteByClassSectionId(Long classSectionId);
    void deleteByFacultyId(Long facultyId);

    @Modifying
    @Query("DELETE FROM Timetable t WHERE t.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
