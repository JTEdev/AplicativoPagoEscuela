package com.aplicativopagoescuela.backend.controller;

import com.aplicativopagoescuela.backend.model.Payment;
import com.aplicativopagoescuela.backend.model.User;
import com.aplicativopagoescuela.backend.service.PaymentService;
import com.aplicativopagoescuela.backend.service.UserService;
import com.aplicativopagoescuela.backend.controller.dto.PaymentDTO;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    private LocalDate parseDateFlexible(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDate.parse(dateStr); // ISO format yyyy-MM-dd
        } catch (Exception e) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
                return LocalDate.parse(dateStr, formatter);
            } catch (Exception ex) {
                try {
                    DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    return LocalDate.parse(dateStr, formatter2);
                } catch (Exception ex2) {
                    logger.error("No se pudo parsear la fecha: {}", dateStr);
                    return null;
                }
            }
        }
    }

    @GetMapping
    public List<Map<String, Object>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        logger.info("Pagos encontrados en la base de datos: {}", payments.size());
        payments.forEach(p -> logger.info("Pago: id={}, user={}, concept={}, amount={}", p.getId(), p.getUser() != null ? p.getUser().getName() : "null", p.getConcept(), p.getAmount()));
        return payments.stream().map(payment -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", payment.getId());
            map.put("studentName", payment.getUser() != null ? payment.getUser().getName() : null);
            map.put("concept", payment.getConcept());
            map.put("amount", payment.getAmount());
            map.put("dueDate", payment.getDate() != null ? payment.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : "N/A"); // Siempre yyyy-MM-dd
            map.put("paidDate", payment.getPaidDate() != null ? payment.getPaidDate().toString() : "N/A"); // Mostrar N/A si es null
            map.put("status", payment.getStatus() != null ? payment.getStatus() : "N/A"); // Asegura que siempre haya un estado
            map.put("invoiceNumber", payment.getInvoiceNumber());
            map.put("grade", payment.getUser() != null && payment.getUser().getGrade() != null ? payment.getUser().getGrade() : "N/A");
            return map;
        }).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Optional<Payment> payment = paymentService.getPaymentById(id);
        return payment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUser(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);
        if (user.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(paymentService.getPaymentsByUser(user.get()));
    }

    @PostMapping
    public ResponseEntity<Object> createPayment(@RequestBody PaymentDTO paymentDTO) {
        logger.info("Intentando crear pago: {}", paymentDTO);
        Optional<User> userOpt = userService.getAllUsers().stream()
            .filter(u -> u.getName().trim().equalsIgnoreCase(paymentDTO.studentName.trim()))
            .findFirst();
        if (userOpt.isEmpty()) {
            logger.error("Usuario no encontrado para el pago: {}", paymentDTO.studentName);
            return ResponseEntity.badRequest().body("Usuario no encontrado para el pago: " + paymentDTO.studentName);
        }
        try {
            Payment payment = new Payment();
            payment.setUser(userOpt.get());
            payment.setAmount(paymentDTO.amount);
            // Traducción de status si viene en español
            String status = paymentDTO.status;
            if (status != null) {
                if (status.equalsIgnoreCase("Pendiente")) status = "PENDING";
                else if (status.equalsIgnoreCase("Pagado")) status = "PAID";
                else if (status.equalsIgnoreCase("Paid")) status = "PAID";
            }
            payment.setStatus(status);
            payment.setDate(parseDateFlexible(paymentDTO.dueDate));
            payment.setConcept(paymentDTO.concept);
            payment.setInvoiceNumber(paymentDTO.invoiceNumber);
            // Lógica para paidDate
            if (paymentDTO.paidDate != null && !paymentDTO.paidDate.isEmpty()) {
                payment.setPaidDate(parseDateFlexible(paymentDTO.paidDate));
            } else {
                // Si el estado es PAID y paidDate es null, asignar fecha actual SOLO si el status es exactamente "PAID" (mayúsculas)
                if ("PAID".equals(payment.getStatus())) {
                    payment.setPaidDate(LocalDate.now());
                } else {
                    payment.setPaidDate(null);
                }
            }
            // Validación explícita de campos obligatorios
            if (payment.getUser() == null || payment.getAmount() == null || payment.getStatus() == null || payment.getDate() == null || payment.getConcept() == null) {
                logger.error("Faltan campos obligatorios: user={}, amount={}, status={}, date={}, concept={}", payment.getUser(), payment.getAmount(), payment.getStatus(), payment.getDate(), payment.getConcept());
                return ResponseEntity.badRequest().body("Faltan campos obligatorios o hay un valor nulo");
            }
            logger.info("Datos a guardar: user={}, amount={}, status={}, date={}, concept={}, invoiceNumber={}, paidDate={}", payment.getUser().getName(), payment.getAmount(), payment.getStatus(), payment.getDate(), payment.getConcept(), payment.getInvoiceNumber(), payment.getPaidDate());
            logger.info("Pago creado correctamente para usuario: {}", userOpt.get().getName());
            return ResponseEntity.ok(paymentService.savePayment(payment));
        } catch (Exception e) {
            logger.error("Error al crear el pago: ", e);
            return ResponseEntity.badRequest().body("Error al crear el pago: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updatePayment(@PathVariable Long id, @RequestBody PaymentDTO paymentDTO) {
        Optional<Payment> existingOpt = paymentService.getPaymentById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        Payment payment = existingOpt.get();

        updatePaymentFields(payment, paymentDTO);
        normalizeAndSetStatus(payment, paymentDTO.status);
        updatePaidDate(payment, paymentDTO.paidDate);

        Payment saved = paymentService.savePayment(payment);
        Map<String, Object> dto = Map.of(
            "id", saved.getId(),
            "studentName", saved.getUser().getName(),
            "concept", saved.getConcept(),
            "amount", saved.getAmount(),
            "dueDate", saved.getDate() != null ? saved.getDate().toString() : "N/A",
            "paidDate", saved.getPaidDate() != null ? saved.getPaidDate().toString() : "N/A",
            "status", saved.getStatus() != null ? saved.getStatus() : "N/A",
            "invoiceNumber", saved.getInvoiceNumber()
        );
        return ResponseEntity.ok(dto);
    }

    private void updatePaymentFields(Payment payment, PaymentDTO paymentDTO) {
        if (paymentDTO.studentName != null) {
            Optional<User> userOpt = userService.getAllUsers().stream()
                .filter(u -> u.getName().trim().equalsIgnoreCase(paymentDTO.studentName.trim()))
                .findFirst();
            userOpt.ifPresent(payment::setUser);
        }
        if (paymentDTO.amount != null) payment.setAmount(paymentDTO.amount);
        if (paymentDTO.dueDate != null) payment.setDate(parseDateFlexible(paymentDTO.dueDate));
        if (paymentDTO.concept != null) payment.setConcept(paymentDTO.concept);
        if (paymentDTO.invoiceNumber != null) payment.setInvoiceNumber(paymentDTO.invoiceNumber);
    }

    private void normalizeAndSetStatus(Payment payment, String status) {
        if (status != null) {
            if (status.equalsIgnoreCase("Pendiente")) status = "PENDING";
            else if (status.equalsIgnoreCase("Pagado") || status.equalsIgnoreCase("Paid")) status = "PAID";
            else status = status.toUpperCase();
            payment.setStatus(status);
        }
    }

    private void updatePaidDate(Payment payment, String paidDateStr) {
        if ("PAID".equals(payment.getStatus())) {
            if (paidDateStr != null && !paidDateStr.isEmpty()) {
                payment.setPaidDate(parseDateFlexible(paidDateStr));
            } else if (payment.getPaidDate() == null) {
                payment.setPaidDate(LocalDate.now());
            }
        } else {
            payment.setPaidDate(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
