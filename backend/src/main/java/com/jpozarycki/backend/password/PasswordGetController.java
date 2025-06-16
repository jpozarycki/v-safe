package com.jpozarycki.backend.password;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
class PasswordGetController {

    private final PasswordGetService passwordGetService;
}
