package com.jpozarycki.backend.password;

import com.jpozarycki.backend.password.encryption.PasswordAttributeConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "passwords")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PasswordEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Convert(converter = PasswordAttributeConverter.class)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String domain;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
