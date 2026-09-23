package com.eduverse.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Singleton row (id always 1) holding platform-wide configuration set by the Master Admin. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "system_config")
public class SystemConfig extends BaseEntity {

    @Column(name = "smtp_host")
    @Builder.Default
    private String smtpHost = "smtp.sendgrid.net";

    @Column(name = "smtp_port")
    @Builder.Default
    private int smtpPort = 587;

    @Column(name = "sender_email")
    @Builder.Default
    private String senderEmail = "noreply@eduverse.com";

    @Column(name = "sms_gateway_provider")
    @Builder.Default
    private String smsGatewayProvider = "Twilio API";

    @Column(name = "storage_provider")
    @Builder.Default
    private String storageProvider = "AWS S3 / Local Hybrid";

    @Column(name = "default_academic_year")
    @Builder.Default
    private String defaultAcademicYear = "2026-2027";

    @Column(name = "maintenance_mode")
    @Builder.Default
    private boolean maintenanceMode = false;

    @Column(name = "allow_self_registration")
    @Builder.Default
    private boolean allowSelfRegistration = false;
}
