package com.eduverse.dto.response;

import java.util.List;

public record BulkImportResponse(
        int totalRecords,
        int successCount,
        int errorCount,
        List<String> errors
) {
}
