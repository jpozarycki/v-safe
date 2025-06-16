package com.jpozarycki.backend.password.dto;

public record PasswordSaveRequest(String domain,
                                  String password) {
}

//public record PasswordSaveRequest(@NotBlank(message = "Field 'domain' is missing")
//                                  @Pattern(regexp = "^(?!-)(?:[a-zA-Z0-9-]{1,63}(?<!-)\\\\.)+[a-zA-Z]{2,}$", message = "Invalid domain format")
//                                  String domain,
//                                  @NotBlank(message = "Field 'password' is missing")
//                                  String password) {
//}

