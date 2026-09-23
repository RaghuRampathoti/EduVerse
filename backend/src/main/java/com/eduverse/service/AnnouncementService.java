package com.eduverse.service;

import com.eduverse.dto.request.CreateAnnouncementRequest;
import com.eduverse.dto.response.AnnouncementResponse;
import com.eduverse.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AnnouncementService {
    AnnouncementResponse create(Long institutionId, Long postedByUserId, CreateAnnouncementRequest request);
    Page<AnnouncementResponse> listForAudience(Long institutionId, Role viewerRole, Pageable pageable);
    void delete(Long institutionId, Long announcementId);
}
