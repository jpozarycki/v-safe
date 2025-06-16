package com.jpozarycki.backend.password;

import com.jpozarycki.backend.password.dto.PasswordSaveRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
class PasswordSaveController {

    private final PasswordSaveService passwordSaveService;

    @PostMapping("/api/password")
    ResponseEntity<Void> savePassword(@RequestBody PasswordSaveRequest request) {
//    ResponseEntity<Void> savePassword(@RequestBody @Valid PasswordSaveRequest request) {
        passwordSaveService.savePassword(request.password(), request.domain());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
