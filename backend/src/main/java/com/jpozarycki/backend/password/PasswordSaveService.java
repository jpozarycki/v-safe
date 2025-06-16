package com.jpozarycki.backend.password;

public interface PasswordSaveService {
    void savePassword(String password, String domain);
}
