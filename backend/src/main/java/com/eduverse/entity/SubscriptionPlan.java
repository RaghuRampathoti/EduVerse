package com.eduverse.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * A SaaS pricing tier that Master Admin defines and assigns to institutions
 * via InstitutionSubscription.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private double price;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    private BillingCycle billingCycle;

    @Column(name = "validity_period")
    private String validityPeriod;

    @Column(name = "max_students")
    private int maxStudents;

    @Column(name = "max_faculty")
    private int maxFaculty;

    @Column(name = "storage_gb")
    private int storageGb;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PlanStatus status = PlanStatus.ACTIVE;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "subscription_plan_modules", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "module_name")
    @Builder.Default
    private List<String> modules = new ArrayList<>();
}
