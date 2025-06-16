package com.jpozarycki.backend.password.impl;

import com.jpozarycki.backend.password.PasswordEntity;
import com.jpozarycki.backend.password.PasswordRepository;
import com.jpozarycki.backend.password.PasswordSaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
class PasswordSaveServiceImpl implements PasswordSaveService {
    private final PasswordRepository passwordRepository;

    @Override
    public void savePassword(final String password, final String domain) {
        var entity = new PasswordEntity();
        entity.setPassword(password);
        entity.setDomain(domain);
        entity.setCreatedAt(LocalDateTime.now());
        passwordRepository.save(entity);
    }
}
