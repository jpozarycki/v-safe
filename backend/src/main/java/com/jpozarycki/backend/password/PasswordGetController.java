package com.jpozarycki.backend.password;

import com.jpozarycki.backend.password.dto.GetPasswordsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
class PasswordGetController {

    private final PasswordGetService passwordGetService;

    @GetMapping(path = "/api/password")
    ResponseEntity<GetPasswordsResponse> getPasswords(@RequestParam(name = "domain", required = false) String domain) {
        var passwords = passwordGetService.getPasswords(domain);
        return ResponseEntity.ok(new GetPasswordsResponse(passwords));
    }
}
