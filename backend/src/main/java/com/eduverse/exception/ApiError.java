package com.eduverse.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        boolean success,
        String message,
        int status,
        LocalDateTime timestamp,
        Map<String, String> fieldErrors
) {
    public static ApiError of(String message, int status) {
        return new ApiError(false, message, status, LocalDateTime.now(), null);
    }

    public static ApiError of(String message, int status, Map<String, String> fieldErrors) {
        return new ApiError(false, message, status, LocalDateTime.now(), fieldErrors);
    }
}
