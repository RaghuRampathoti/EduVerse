package com.eduverse.repository;

import com.eduverse.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    boolean existsByCode(String code);
    Optional<SubscriptionPlan> findByCode(String code);
}
