package com.eduverse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "eduverse.cors")
public record CorsProperties(List<String> allowedOrigins) {
}
