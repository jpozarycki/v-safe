package com.jpozarycki.backend.password.encryption;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Converter
@Component
@RequiredArgsConstructor
public class PasswordAttributeConverter implements AttributeConverter<String, String> {

    private final PasswordEncryptionService encryptionService;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute != null ? encryptionService.encrypt(attribute) : null;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData != null ? encryptionService.decrypt(dbData) : null;
    }
} 