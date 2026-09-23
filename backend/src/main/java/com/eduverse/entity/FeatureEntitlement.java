package com.eduverse.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
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

/** A feature module (Attendance, Fees, Exams...) and which plan tiers it is entitled to. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "feature_entitlements")
public class FeatureEntitlement extends BaseEntity {

    @Column(name = "module_name", nullable = false)
    private String moduleName;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "enabled_global")
    @Builder.Default
    private boolean enabledGlobal = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "feature_entitlement_plans", joinColumns = @JoinColumn(name = "entitlement_id"))
    @Column(name = "plan_code")
    @Builder.Default
    private List<String> plansAllowed = new ArrayList<>();
}
