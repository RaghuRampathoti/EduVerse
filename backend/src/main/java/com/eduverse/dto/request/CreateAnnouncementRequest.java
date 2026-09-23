package com.eduverse.dto.request;

import com.eduverse.entity.AnnouncementAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAnnouncementRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotNull AnnouncementAudience audience,
        boolean pinned
) {}
