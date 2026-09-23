package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A class/grade + section grouping, e.g. "Grade 10" / "A", or "B.Sc CS" / "Sem 3".
 * Students and Faculty (as class-teacher) attach to this for attendance, fees, etc.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "class_sections")
public class ClassSection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "class_name", nullable = false)
    private String className; // e.g. "Grade 10", "B.Tech CSE Year 2"

    @Column(name = "section_name")
    private String sectionName; // e.g. "A", "Sem 3"

    @Column(name = "academic_year")
    private String academicYear; // e.g. "2026-2027"

    @Enumerated(EnumType.STRING)
    @Column(name = "institution_type")
    private InstitutionType institutionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_id")
    private FacultyProfile classTeacher;
}
