package com.jpozarycki.backend.password.impl;

import com.jpozarycki.backend.password.PasswordGetService;
import com.jpozarycki.backend.password.dto.PasswordDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
class PasswordGetServiceImpl implements PasswordGetService {
    @Override
    public List<PasswordDto> getPasswords(final String domain) {
        return List.of();
    }
}
