package com.jpozarycki.backend.password.impl;

import com.jpozarycki.backend.password.PasswordEntity;
import com.jpozarycki.backend.password.PasswordGetService;
import com.jpozarycki.backend.password.PasswordRepository;
import com.jpozarycki.backend.password.dto.PasswordDto;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
class PasswordGetServiceImpl implements PasswordGetService {
    private final PasswordRepository passwordRepository;

    @Override
    public List<PasswordDto> getPasswords(@Nullable final String domain) {
        List<PasswordEntity> passwords;
        if (domain == null) {
            passwords = passwordRepository.findAll();
        } else {
            passwords = passwordRepository.findByDomain(domain);
        }
        return passwords.stream()
                .map(password -> new PasswordDto(password.getId(), password.getDomain(), password.getPassword()))
                .toList();
    }
}
