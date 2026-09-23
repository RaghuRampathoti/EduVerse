package com.eduverse.repository;

import com.eduverse.entity.FeatureEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureEntitlementRepository extends JpaRepository<FeatureEntitlement, Long> {
    boolean existsByCode(String code);
}
