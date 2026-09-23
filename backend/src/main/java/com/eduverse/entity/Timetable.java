package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Table(name = "timetables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Timetable extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_section_id", nullable = false)
    private ClassSection classSection;

    @Column(nullable = false, length = 20)
    private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY

    @Column(nullable = false)
    private Integer periodNumber; // 1, 2, 3, 4, 5, 6, 7

    @Column(length = 50)
    private String periodName; // e.g. "Period 1", "Morning Session"

    @Column(length = 20)
    private String startTime; // e.g. "09:00 AM"

    @Column(length = 20)
    private String endTime; // e.g. "09:45 AM"

    @Column(nullable = false, length = 100)
    private String subject; // e.g. "Mathematics"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id")
    private FacultyProfile faculty; // assigned teacher

    @Column(length = 50)
    private String roomNumber; // e.g. "Room 101"
}
