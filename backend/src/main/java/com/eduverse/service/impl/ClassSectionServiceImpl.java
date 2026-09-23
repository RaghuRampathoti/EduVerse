package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateClassSectionRequest;
import com.eduverse.dto.response.ClassSectionResponse;
import com.eduverse.entity.ClassSection;
import com.eduverse.entity.FacultyProfile;
import com.eduverse.entity.Institution;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.ClassSectionRepository;
import com.eduverse.repository.FacultyProfileRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.StudentProfileRepository;
import com.eduverse.service.ClassSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassSectionServiceImpl implements ClassSectionService {

    private final ClassSectionRepository classSectionRepository;
    private final InstitutionRepository institutionRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final com.eduverse.repository.TimetableRepository timetableRepository;
    private final com.eduverse.repository.StudentAttendanceRepository studentAttendanceRepository;
    private final com.eduverse.repository.FeeStructureRepository feeStructureRepository;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public ClassSectionResponse create(Long institutionId, CreateClassSectionRequest request) {
        if (institutionId == null) {
            throw new com.eduverse.exception.BadRequestException("Institution ID is required to create a Class/Section");
        }
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        FacultyProfile teacher = null;
        if (request.classTeacherId() != null) {
            teacher = facultyProfileRepository.findByIdAndInstitutionId(request.classTeacherId(), institutionId)
                    .orElse(null);
        }

        ClassSection section = ClassSection.builder()
                .institution(institution)
                .className(request.className())
                .sectionName(request.sectionName())
                .academicYear(request.academicYear())
                .classTeacher(teacher)
                .institutionType(request.institutionType() != null ? request.institutionType() : (institution.getType() != null ? institution.getType() : com.eduverse.entity.InstitutionType.COLLEGE))
                .build();
        section = classSectionRepository.save(section);
        auditLogService.log(institutionId, "CREATE_CLASS_SECTION", "CLASS_SECTION", section.getId(),
                "Created class '" + section.getClassName() + "-" + section.getSectionName() + "' for academic year " + section.getAcademicYear());
        return toResponse(section);
    }

    @Override
    public List<ClassSectionResponse> list(Long institutionId) {
        if (institutionId == null) {
            return List.of();
        }
        List<ClassSection> list = classSectionRepository.findByInstitutionId(institutionId);
        return list.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ClassSectionResponse update(Long institutionId, Long id, CreateClassSectionRequest request) {
        ClassSection section = findScoped(institutionId, id);
        section.setClassName(request.className());
        section.setSectionName(request.sectionName());
        section.setAcademicYear(request.academicYear());
        if (request.institutionType() != null) {
            section.setInstitutionType(request.institutionType());
        }
        if (request.classTeacherId() != null) {
            FacultyProfile teacher = facultyProfileRepository.findById(request.classTeacherId())
                    .orElse(null);
            section.setClassTeacher(teacher);
        } else {
            section.setClassTeacher(null);
        }
        section = classSectionRepository.save(section);
        return toResponse(section);
    }

    @Override
    @Transactional
    public void delete(Long institutionId, Long id) {
        ClassSection section = findScoped(institutionId, id);

        // Unlink students from this class section
        List<com.eduverse.entity.StudentProfile> students = studentProfileRepository.findByClassSectionId(id);
        for (com.eduverse.entity.StudentProfile s : students) {
            s.setClassSection(null);
            studentProfileRepository.save(s);
        }

        // Clean up timetable entries for this class section
        timetableRepository.deleteByClassSectionId(id);

        // Clean up attendance entries
        studentAttendanceRepository.deleteByClassSectionId(id);

        // Unlink fee structures
        List<com.eduverse.entity.FeeStructure> feeStructures = feeStructureRepository.findByClassSectionId(id);
        for (com.eduverse.entity.FeeStructure fs : feeStructures) {
            fs.setClassSection(null);
            feeStructureRepository.save(fs);
        }

        classSectionRepository.delete(section);
        if (institutionId != null) {
            auditLogService.log(institutionId, "DELETE_CLASS_SECTION", "CLASS_SECTION", id,
                    "Deleted class section '" + section.getClassName() + "'");
        }
    }

    private ClassSection findScoped(Long institutionId, Long id) {
        ClassSection section = classSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class/Section not found"));
        if (institutionId != null && section.getInstitution() != null && !section.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Class/Section not found in this institution");
        }
        return section;
    }

    private ClassSectionResponse toResponse(ClassSection section) {
        long count = 0;
        if (section.getInstitution() != null) {
            count = studentProfileRepository.findByInstitutionIdAndClassSectionId(
                    section.getInstitution().getId(), section.getId(), PageRequest.of(0, 1)).getTotalElements();
        }
        return ClassSectionResponse.from(section, count);
    }
}
