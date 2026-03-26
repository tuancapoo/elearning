package com.example.demo.mapper;

import com.example.demo.domain.Payment;
import com.example.demo.dto.response.payment.PaymentResponse;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toPaymentResponse(Payment payment);

}