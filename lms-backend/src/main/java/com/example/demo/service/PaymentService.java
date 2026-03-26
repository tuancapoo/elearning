package com.example.demo.service;

import com.example.demo.domain.Payment;
import com.example.demo.domain.User;
import com.example.demo.dto.request.CreatePaymentRequest;
import com.example.demo.dto.response.payment.PaymentResponse;
import com.example.demo.mapper.PaymentMapper;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;

    public List<PaymentResponse> getAllPayment(String userMail){
        User user=userRepository.findByEmail(userMail).orElse(null);
        List<Payment> list=
                paymentRepository.findAllByUserIdOrderByCreatedAtDesc(user.getUserId());
        return list.stream().map(e-> paymentMapper.toPaymentResponse(e)).toList();
    }
    public PaymentResponse createPayment(CreatePaymentRequest request){
        Payment payment=new Payment();
        payment.setUser(userRepository.findById(request.getUserId()).orElse(null));
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setName(request.getName());
        payment.setCode(null);
        payment.setComplete(false);
        payment.setCreatedAt(LocalDateTime.now());
        Payment saved=paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(saved);
    }
    public PaymentResponse getPaymentById(Long id){
        Payment payment=paymentRepository.findById(id).orElse(null);
        if (payment==null){
            return null;
        }
        return paymentMapper.toPaymentResponse(payment);
    }

}
