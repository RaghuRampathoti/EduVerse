package com.eduverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EduverseApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduverseApplication.class, args);
    }
}
