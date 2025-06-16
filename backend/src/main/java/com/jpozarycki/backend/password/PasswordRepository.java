package com.jpozarycki.backend.password;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordRepository extends JpaRepository<PasswordEntity, Long> {
    List<PasswordEntity> findByDomain(String domain);
}
