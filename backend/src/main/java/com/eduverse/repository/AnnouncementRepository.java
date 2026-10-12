package com.eduverse.repository;

import com.eduverse.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Page<Announcement> findByInstitutionIdOrderByPinnedDescCreatedAtDesc(Long institutionId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM Announcement a WHERE a.institution.id = :institutionId")
    void deleteByInstitutionId(@Param("institutionId") Long institutionId);
}
