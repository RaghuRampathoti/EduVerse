package com.eduverse.service;

import com.eduverse.dto.request.CreateTimetableEntryRequest;
import com.eduverse.dto.response.TimetableEntryResponse;

import java.util.List;

public interface TimetableService {
    List<TimetableEntryResponse> listByClassSection(Long institutionId, Long classSectionId);
    TimetableEntryResponse saveEntry(Long institutionId, CreateTimetableEntryRequest request);
    void deleteEntry(Long institutionId, Long id);
    List<TimetableEntryResponse> assignFirstPeriodToClassTeacher(Long institutionId, Long classSectionId);
}
