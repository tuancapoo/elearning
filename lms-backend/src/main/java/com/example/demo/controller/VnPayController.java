package com.example.demo.controller;


import com.example.demo.config.VnPayConfig;
import com.example.demo.domain.Payment;
import com.example.demo.dto.request.PayRequest;
import com.example.demo.dto.request.VnPayDTO;
import com.example.demo.dto.response.ApiResponse;
import com.example.demo.repository.PaymentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import jakarta.servlet.http.HttpServletResponse;


@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class VnPayController {
    final private PaymentRepository paymentRepository;
    @Value("${pay-url}")
    private String vnp_PayUrl;
    @Value("${return-url}")
    private String vnp_ReturnUrl;
    @Value("${tmn-code}")
    private String vnp_TmnCode;
    @Value("${secret-key}")
    private String secretKey;
    @Value("${api-url}")
    private String vnp_ApiUrl;

    @GetMapping("/create_payment/{paymentId}")
    @Operation(summary = "Pay", description = "Pay with VnPay")
    public ApiResponse<VnPayDTO> createPayment(@PathVariable Long paymentId, HttpServletRequest httpRequest) throws UnsupportedEncodingException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        Payment payment = paymentRepository.findById(paymentId).orElseThrow(() -> new RuntimeException("Payment not found"));
        long amount = payment.getAmount() * 100;
        String vnp_TxnRef = VnPayConfig.getRandomNumber(8);
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", VnPayConfig.getIpAddress(httpRequest));
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        List fieldNames = new ArrayList(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        String paymentUrl = vnp_PayUrl + "?" + queryUrl;
//        com.google.gson.JsonObject job = new JsonObject();
//        job.addProperty("code", "00");
//        job.addProperty("message", "success");
//        job.addProperty("data", paymentUrl);
//        Gson gson = new Gson();
//        resp.getWriter().write(gson.toJson(job));
        payment.setTnxId(vnp_TxnRef);
        paymentRepository.save(payment);
        VnPayDTO payDTO = new VnPayDTO();
        payDTO.setStatus("ok");
        payDTO.setMessage("success");
        payDTO.setUrl(paymentUrl);
        return new ApiResponse<VnPayDTO>(HttpStatus.OK, "Create payment url successfully", payDTO, null);
    }

    @GetMapping("/vnpay_return")
    public void vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

//        String frontendUrl = "http://localhost:3000/payment-result";
        String frontendUrl = "https://elearninggg.vercel.app/payment-result";

        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String signValue = VnPayConfig.hashAllFields(params, secretKey);

        if (!signValue.equals(vnp_SecureHash)) {
            response.sendRedirect(frontendUrl + "?status=invalid");
            return;
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        if ("00".equals(responseCode)) {
            Payment payment = paymentRepository.findByTnxId(txnRef)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            payment.setComplete(true);
            paymentRepository.save(payment);

            response.sendRedirect(frontendUrl + "?status=success");
            return;
        }

        response.sendRedirect(frontendUrl + "?status=fail");

    }
}
