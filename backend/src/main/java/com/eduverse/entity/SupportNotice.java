package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Platform-wide broadcast notice created by the Master Admin (maintenance windows, updates, alerts). */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "support_notices")
public class SupportNotice extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private String audience = "ALL_SUPER_ADMINS";

    @Builder.Default
    private String priority = "MEDIUM";

    @Builder.Default
    private String status = "ACTIVE";
}
