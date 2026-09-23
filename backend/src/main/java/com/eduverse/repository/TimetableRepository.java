package com.eduverse.repository;

import com.eduverse.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByClassSectionId(Long classSectionId);
    List<Timetable> findByInstitutionIdAndClassSectionId(Long institutionId, Long classSectionId);
    List<Timetable> findByFacultyId(Long facultyId);
    Optional<Timetable> findByClassSectionIdAndDayOfWeekAndPeriodNumber(Long classSectionId, String dayOfWeek, Integer periodNumber);
    void deleteByClassSectionId(Long classSectionId);
    void deleteByFacultyId(Long facultyId);
}
