package com.aplicativopagoescuela.backend.repository;

import com.aplicativopagoescuela.backend.model.Payment;
import com.aplicativopagoescuela.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUser(User user);
}
