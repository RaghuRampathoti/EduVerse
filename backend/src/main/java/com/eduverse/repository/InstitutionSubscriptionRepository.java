package com.eduverse.repository;

import com.eduverse.entity.InstitutionSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InstitutionSubscriptionRepository extends JpaRepository<InstitutionSubscription, Long> {
    Optional<InstitutionSubscription> findByInstitutionId(Long institutionId);

    @Modifying
    @Query("DELETE FROM InstitutionSubscription s WHERE s.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
