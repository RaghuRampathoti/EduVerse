package com.eduverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity @Table(name = "exams")
public class Exam extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExamType type = ExamType.MIDTERM;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    /** Comma-separated class names e.g. "Grade 10-A, 10-B" */
    @Column(name = "target_classes")
    private String targetClasses;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ExamStatus status = ExamStatus.SCHEDULED;

    @Column(name = "results_published")
    @Builder.Default
    private boolean resultsPublished = false;

    @Column(name = "created_by")
    private String createdBy;
}
