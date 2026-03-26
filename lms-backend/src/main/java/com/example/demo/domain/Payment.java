package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
@Getter
@Setter
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "userId", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userId", insertable = false, updatable = false)
    private User user;

    @Column(name = "name", columnDefinition = "TEXT")
    private String name;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "createdAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "complete", nullable = false)
    private Boolean complete;

    @Column(name = "code", columnDefinition = "TEXT")
    private String code;

    @Column(name = "tnxId", columnDefinition = "TEXT",unique = true)
    private String tnxId;
}
