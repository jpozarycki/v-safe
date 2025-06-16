package com.jpozarycki.backend.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.Assert;

import jakarta.annotation.PostConstruct;
import java.util.Base64;

@Configuration
public class EncryptionConfiguration {

    @Value("${encryption.secret-key}")
    private String secretKey;

    @PostConstruct
    public void validateConfiguration() {
        byte[] decodedKey = Base64.getDecoder().decode(secretKey);
        Assert.isTrue(decodedKey.length == 32, 
            "Encryption key must be 32 bytes (256 bits) long. Current length: " + decodedKey.length);
    }
} 