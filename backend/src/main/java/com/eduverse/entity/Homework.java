package com.eduverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity @Table(name = "homework")
public class Homework extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(nullable = false)
    private String title;

    private String subject;

    @Column(name = "class_section")
    private String classSection;

    @Column(name = "assigned_faculty")
    private String assignedFaculty;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private HomeworkStatus status = HomeworkStatus.ACTIVE;

    @Column(name = "submissions_count")
    @Builder.Default
    private int submissionsCount = 0;
}
