package com.example.demo.controller;


import com.example.demo.dto.request.CreatePaymentRequest;
import com.example.demo.dto.request.user.CreateUserRequest;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.dto.response.ResultPaginationDTO;
import com.example.demo.dto.response.payment.PaymentResponse;
import com.example.demo.dto.response.userDTO.ResUserDTO;
import com.example.demo.service.PaymentService;
import com.example.demo.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    final private SecurityUtil securityUtil;
    final private PaymentService paymentService;


    @GetMapping
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get danh sách học phí cần trả", description = "create a new user with the provided information")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayment() {
        String user = securityUtil.getCurrentUserLogin()
                .orElseThrow(()-> new RuntimeException("User not found"));
        List<PaymentResponse> result=paymentService.getAllPayment(user);
        ApiResponse<List<PaymentResponse>> response=new ApiResponse<>(HttpStatus.OK,"get successful",result,null);
        return ResponseEntity.ok().body(response);
    }
    @GetMapping("/{paymentId}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get danh sách học phí cần trả", description = "create a new user with the provided information")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById( @PathVariable Long paymentId) {
        String user = securityUtil.getCurrentUserLogin()
                .orElseThrow(()-> new RuntimeException("User not found"));
        PaymentResponse result=paymentService.getPaymentById(paymentId);
        ApiResponse<PaymentResponse> response=new ApiResponse<>(HttpStatus.OK,"get successful",result,null);
        return ResponseEntity.ok().body(response);
    }
    @PostMapping
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<ApiResponse<PaymentResponse>> createUser( @RequestBody CreatePaymentRequest request) {
        PaymentResponse response = paymentService.createPayment(request);
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>(HttpStatus.CREATED, "User payment successfully",
                response, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
}
