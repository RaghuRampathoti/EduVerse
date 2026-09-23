package com.eduverse.repository;

import com.eduverse.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Page<Announcement> findByInstitutionIdOrderByPinnedDescCreatedAtDesc(Long institutionId, Pageable pageable);
}
