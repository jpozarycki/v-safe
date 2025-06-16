package com.jpozarycki.backend.password.dto;

import java.util.List;

public record GetPasswordsResponse(List<PasswordDto> data) {
}
