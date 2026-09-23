package com.eduverse.service.impl;

import com.eduverse.dto.request.CreateAnnouncementRequest;
import com.eduverse.dto.response.AnnouncementResponse;
import com.eduverse.entity.Announcement;
import com.eduverse.entity.AnnouncementAudience;
import com.eduverse.entity.Institution;
import com.eduverse.entity.Role;
import com.eduverse.entity.User;
import com.eduverse.exception.ResourceNotFoundException;
import com.eduverse.repository.AnnouncementRepository;
import com.eduverse.repository.InstitutionRepository;
import com.eduverse.repository.UserRepository;
import com.eduverse.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final com.eduverse.service.AuditLogService auditLogService;

    @Override
    @Transactional
    public AnnouncementResponse create(Long institutionId, Long postedByUserId, CreateAnnouncementRequest request) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
        User postedBy = userRepository.findById(postedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Announcement announcement = Announcement.builder()
                .institution(institution)
                .title(request.title())
                .content(request.content())
                .audience(request.audience())
                .pinned(request.pinned())
                .postedBy(postedBy)
                .build();
        announcement = announcementRepository.save(announcement);
        auditLogService.log(institutionId, "CREATE_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.getId(),
                "Posted announcement '" + announcement.getTitle() + "' to audience " + announcement.getAudience());
        return AnnouncementResponse.from(announcement);
    }

    @Override
    public Page<AnnouncementResponse> listForAudience(Long institutionId, Role viewerRole, Pageable pageable) {
        List<Announcement> all = announcementRepository
                .findByInstitutionIdOrderByPinnedDescCreatedAtDesc(institutionId, Pageable.unpaged())
                .getContent();

        List<Announcement> filtered = all.stream()
                .filter(a -> isVisibleTo(a.getAudience(), viewerRole))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<Announcement> pageContent = start >= filtered.size() ? List.of() : filtered.subList(start, end);

        return new PageImpl<>(
                pageContent.stream().map(AnnouncementResponse::from).toList(),
                pageable,
                filtered.size()
        );
    }

    @Override
    @Transactional
    public void delete(Long institutionId, Long announcementId) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));
        if (!announcement.getInstitution().getId().equals(institutionId)) {
            throw new ResourceNotFoundException("Announcement not found in this institution");
        }
        announcementRepository.delete(announcement);
    }

    private boolean isVisibleTo(AnnouncementAudience audience, Role viewerRole) {
        if (audience == AnnouncementAudience.ALL) return true;
        return switch (viewerRole) {
            case STUDENT -> audience == AnnouncementAudience.STUDENTS;
            case FACULTY -> audience == AnnouncementAudience.FACULTY;
            case PARENT -> audience == AnnouncementAudience.PARENTS;
            case ADMIN, SUPER_ADMIN, MASTER_ADMIN -> true; // admins see everything
        };
    }
}
