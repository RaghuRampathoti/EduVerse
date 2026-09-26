package com.eduverse.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;

import java.net.URI;

@Configuration
public class DatabaseConfig implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Override
    public Object postProcessBeforeInitialization(@NonNull Object bean, @NonNull String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties properties) {
            String url = properties.getUrl();
            if (url != null && !url.isBlank()) {
                normalizeDataSourceProperties(properties, url);
            }
        }
        return bean;
    }

    private void normalizeDataSourceProperties(DataSourceProperties properties, String rawUrl) {
        String url = rawUrl.trim();

        // Clean out channel_binding parameters which pgJDBC driver doesn't support
        url = cleanQueryParam(url, "channel_binding");

        if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
            log.info("Converting raw PostgreSQL URI format to Spring JDBC format...");
            try {
                String uriSchemePrefix = url.startsWith("postgresql://") ? "postgresql://" : "postgres://";
                String pseudoUrl = "http://" + url.substring(uriSchemePrefix.length());
                URI uri = URI.create(pseudoUrl);

                String host = uri.getHost();
                int port = uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();
                String userInfo = uri.getUserInfo();

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (properties.getUsername() == null || properties.getUsername().isBlank()) {
                        properties.setUsername(parts[0]);
                    }
                    if (properties.getPassword() == null || properties.getPassword().isBlank()) {
                        properties.setPassword(parts[1]);
                    }
                }

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(host);
                if (port != -1) {
                    jdbcUrl.append(":").append(port);
                }
                if (path != null) {
                    jdbcUrl.append(path);
                }
                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                } else {
                    jdbcUrl.append("?sslmode=require");
                }

                String finalJdbcUrl = jdbcUrl.toString();
                log.info("Normalized JDBC URL: {}", finalJdbcUrl);
                properties.setUrl(finalJdbcUrl);
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI: {}. Prepending 'jdbc:' prefix.", e.getMessage());
                properties.setUrl("jdbc:" + url);
            }
        } else {
            properties.setUrl(url);
        }
    }

    private String cleanQueryParam(String url, String paramName) {
        String pattern = "(?i)[?&]" + paramName + "=[^&]*";
        String cleaned = url.replaceAll(pattern, "");
        if (url.contains("?") && !cleaned.contains("?") && cleaned.contains("&")) {
            int firstAmp = cleaned.indexOf("&");
            cleaned = cleaned.substring(0, firstAmp) + "?" + cleaned.substring(firstAmp + 1);
        }
        return cleaned;
    }
}
