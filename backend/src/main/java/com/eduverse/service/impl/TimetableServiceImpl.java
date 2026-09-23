package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateTimetableEntryRequest;
import com.eduverse.dto.response.TimetableEntryResponse;
import com.eduverse.entity.ClassSection;
import com.eduverse.entity.FacultyProfile;
import com.eduverse.entity.Institution;
import com.eduverse.entity.Timetable;
import com.eduverse.exception.BadRequestException;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ClassSectionRepository;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.TimetableRepository;
import com.eduverse.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final ClassSectionRepository classSectionRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    public List<TimetableEntryResponse> listByClassSection(Long institutionId, Long classSectionId) {
        if (institutionId == null || classSectionId == null) {
            return List.of();
        }
        List<Timetable> entries = timetableRepository.findByInstitutionIdAndClassSectionId(institutionId, classSectionId);
        return entries.stream().map(TimetableEntryResponse::from).toList();
    }

    @Override
    @Transactional
    public TimetableEntryResponse saveEntry(Long institutionId, CreateTimetableEntryRequest request) {
        ClassSection classSection = classSectionRepository.findById(request.classSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Class/Section not found"));

        Institution institution = classSection.getInstitution();

        FacultyProfile faculty = null;
        if (request.facultyId() != null) {
            faculty = facultyProfileRepository.findById(request.facultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found"));
        }

        Timetable existing = timetableRepository
                .findByClassSectionIdAndDayOfWeekAndPeriodNumber(
                        classSection.getId(), request.dayOfWeek().toUpperCase(), request.periodNumber())
                .orElse(null);

        Timetable entry = existing != null ? existing : Timetable.builder()
                .institution(institution)
                .classSection(classSection)
                .dayOfWeek(request.dayOfWeek().toUpperCase())
                .periodNumber(request.periodNumber())
                .build();

        entry.setPeriodName(request.periodName() != null ? request.periodName() : "Period " + request.periodNumber());
        entry.setStartTime(request.startTime() != null ? request.startTime() : "09:00 AM");
        entry.setEndTime(request.endTime() != null ? request.endTime() : "09:45 AM");
        entry.setSubject(request.subject());
        entry.setFaculty(faculty);
        entry.setRoomNumber(request.roomNumber() != null ? request.roomNumber() : "Classroom");

        entry = timetableRepository.save(entry);
        auditLogService.log(institutionId, "CREATE_TIMETABLE_ENTRY", "TIMETABLE", entry.getId(),
                "Set timetable entry for " + classSection.getClassName() + "-" + classSection.getSectionName()
                        + " on " + entry.getDayOfWeek() + " period " + entry.getPeriodNumber());
        return TimetableEntryResponse.from(entry);
    }

    @Override
    @Transactional
    public void deleteEntry(Long institutionId, Long id) {
        Timetable entry = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found"));
        timetableRepository.delete(entry);
    }

    @Override
    @Transactional
    public List<TimetableEntryResponse> assignFirstPeriodToClassTeacher(Long institutionId, Long classSectionId) {
        ClassSection classSection = classSectionRepository.findById(classSectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class/Section not found"));

        FacultyProfile classTeacher = classSection.getClassTeacher();
        if (classTeacher == null) {
            throw new BadRequestException("No Class Teacher assigned to " + classSection.getClassName()
                    + " (" + (classSection.getSectionName() != null ? classSection.getSectionName() : "")
                    + "). Please assign a Class Teacher in Classes & Sections module first.");
        }

        Institution institution = classSection.getInstitution();
        List<String> days = List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");

        for (String day : days) {
            Timetable existing = timetableRepository
                    .findByClassSectionIdAndDayOfWeekAndPeriodNumber(classSection.getId(), day, 1)
                    .orElse(null);

            Timetable entry = existing != null ? existing : Timetable.builder()
                    .institution(institution)
                    .classSection(classSection)
                    .dayOfWeek(day)
                    .periodNumber(1)
                    .build();

            entry.setPeriodName("Period 1");
            entry.setStartTime("09:00 AM");
            entry.setEndTime("09:45 AM");
            entry.setSubject("Class Teacher Period / Attendance");
            entry.setFaculty(classTeacher);
            entry.setRoomNumber("Classroom");

            timetableRepository.save(entry);
        }

        return listByClassSection(institutionId, classSectionId);
    }
}
