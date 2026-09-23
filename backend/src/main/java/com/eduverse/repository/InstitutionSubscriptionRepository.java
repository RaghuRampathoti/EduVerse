package com.eduverse.repository;

import com.eduverse.entity.InstitutionSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitutionSubscriptionRepository extends JpaRepository<InstitutionSubscription, Long> {
    Optional<InstitutionSubscription> findByInstitutionId(Long institutionId);
}
