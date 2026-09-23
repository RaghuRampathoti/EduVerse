package com.eduverse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "eduverse.master-admin")
public record MasterAdminProperties(String email, String password, boolean seedOnStartup) {
}
