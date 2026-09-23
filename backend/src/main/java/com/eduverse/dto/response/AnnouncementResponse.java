package com.eduverse.dto.response;

import com.eduverse.entity.Announcement;
import com.eduverse.entity.AnnouncementAudience;

import java.time.LocalDateTime;

public record AnnouncementResponse(
        Long id,
        String title,
        String content,
        AnnouncementAudience audience,
        boolean pinned,
        String postedByName,
        LocalDateTime createdAt
) {
    public static AnnouncementResponse from(Announcement a) {
        return new AnnouncementResponse(
                a.getId(), a.getTitle(), a.getContent(), a.getAudience(),
                a.isPinned(), a.getPostedBy().getFullName(), a.getCreatedAt()
        );
    }
}
