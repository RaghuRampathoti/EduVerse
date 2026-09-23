package com.eduverse.repository;

import com.eduverse.entity.SupportNotice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportNoticeRepository extends JpaRepository<SupportNotice, Long> {
    List<SupportNotice> findAllByOrderByCreatedAtDesc();
}
