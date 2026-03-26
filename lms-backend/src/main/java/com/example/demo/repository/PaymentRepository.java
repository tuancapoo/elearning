package com.example.demo.repository;

import com.example.demo.domain.Course;
import com.example.demo.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    List<Payment> findAllByUserIdOrderByCreatedAtDesc(String userId);
}
