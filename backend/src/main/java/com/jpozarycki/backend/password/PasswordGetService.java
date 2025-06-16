package com.jpozarycki.backend.password;

import com.jpozarycki.backend.password.dto.PasswordDto;
import org.springframework.lang.Nullable;

import java.util.List;

public interface PasswordGetService {

    List<PasswordDto> getPasswords(@Nullable String domain);
}
