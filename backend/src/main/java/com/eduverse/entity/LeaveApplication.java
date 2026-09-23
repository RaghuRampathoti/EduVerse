package com.eduverse.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity @Table(name = "leave_applications")
public class LeaveApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "applicant_role")
    @Enumerated(EnumType.STRING)
    private Role applicantRole;

    @Column(name = "applicant_user_id")
    private Long applicantUserId;

    @Column(name = "leave_type")
    private String leaveType; // MEDICAL, PERSONAL, FAMILY, CASUAL

    @Column(name = "from_date")
    private LocalDate fromDate;

    @Column(name = "to_date")
    private LocalDate toDate;

    @Column(name = "days_count")
    private int daysCount;

    @Column(length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "reviewed_by")
    private String reviewedBy;
}
