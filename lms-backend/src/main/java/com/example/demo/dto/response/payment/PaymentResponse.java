package com.example.demo.dto.response.payment;

import com.example.demo.domain.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    private Long id;
    private String userId;
    private User user;
    private String name;
    private Double amount;
    private LocalDateTime createdAt;
    private Boolean complete;
    private String code;
}
