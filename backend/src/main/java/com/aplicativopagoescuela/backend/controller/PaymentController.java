
package com.aplicativopagoescuela.backend.controller;

import org.springframework.http.HttpEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.aplicativopagoescuela.backend.model.Payment;
import com.aplicativopagoescuela.backend.model.User;
import com.aplicativopagoescuela.backend.service.PaymentService;
import com.aplicativopagoescuela.backend.service.UserService;
import com.aplicativopagoescuela.backend.controller.dto.PaymentDTO;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Value("${paypal.client-id}")
    private String paypalClientId;
    @Value("${paypal.client-secret}")
    private String paypalClientSecret;
    @Value("${paypal.base-url}")
    private String paypalBaseUrl;
    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody PaymentDTO dto) {
        Payment payment = new Payment();
        payment.setAmount(dto.getAmount());
        payment.setConcept(dto.getConcept());
        payment.setStatus(dto.getStatus());
        payment.setInvoiceNumber(dto.getInvoiceNumber());
        payment.setPaidDate(dto.getPaidDate() != null && !dto.getPaidDate().isEmpty() ? LocalDate.parse(dto.getPaidDate()) : null);
        payment.setDate(dto.getDueDate() != null && !dto.getDueDate().isEmpty() ? LocalDate.parse(dto.getDueDate()) : null);
        // Asignar usuario si se envía studentId
        if (dto.getStudentId() != null) {
            Optional<User> userOpt = userService.getUserById(dto.getStudentId());
            userOpt.ifPresent(payment::setUser);
        }
        Payment saved = paymentService.savePayment(payment);
        PaymentDTO responseDto = new PaymentDTO();
        responseDto.setId(saved.getId());
        responseDto.setAmount(saved.getAmount());
        responseDto.setConcept(saved.getConcept());
        responseDto.setStatus(saved.getStatus());
        responseDto.setInvoiceNumber(saved.getInvoiceNumber());
        responseDto.setPaidDate(saved.getPaidDate() != null ? saved.getPaidDate().toString() : null);
        responseDto.setDueDate(saved.getDate() != null ? saved.getDate().toString() : null);
        if (saved.getUser() != null) {
            responseDto.setStudentId(saved.getUser().getId());
            responseDto.setStudentName(saved.getUser().getName());
        }
        return ResponseEntity.ok(responseDto);
    }
    @PutMapping("/{id}")
    public ResponseEntity<PaymentDTO> updatePayment(@PathVariable Long id, @RequestBody PaymentDTO dto) {
        Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Payment payment = paymentOpt.get();
        payment.setAmount(dto.getAmount());
        payment.setConcept(dto.getConcept());
        payment.setStatus(dto.getStatus());
        payment.setInvoiceNumber(dto.getInvoiceNumber());
        payment.setPaidDate(dto.getPaidDate() != null && !dto.getPaidDate().isEmpty() ? LocalDate.parse(dto.getPaidDate()) : null);
        payment.setDate(dto.getDueDate() != null && !dto.getDueDate().isEmpty() ? LocalDate.parse(dto.getDueDate()) : null);
        // Si se envía studentId, actualizar el usuario
        if (dto.getStudentId() != null) {
            Optional<User> userOpt = userService.getUserById(dto.getStudentId());
            userOpt.ifPresent(payment::setUser);
        }
        Payment updated = paymentService.savePayment(payment);
        // Mapear a DTO para respuesta
        PaymentDTO responseDto = new PaymentDTO();
        responseDto.setId(updated.getId());
        responseDto.setAmount(updated.getAmount());
        responseDto.setConcept(updated.getConcept());
        responseDto.setStatus(updated.getStatus());
        responseDto.setInvoiceNumber(updated.getInvoiceNumber());
        responseDto.setPaidDate(updated.getPaidDate() != null ? updated.getPaidDate().toString() : null);
        responseDto.setDueDate(updated.getDate() != null ? updated.getDate().toString() : null);
        if (updated.getUser() != null) {
            responseDto.setStudentId(updated.getUser().getId());
            responseDto.setStudentName(updated.getUser().getName());
        }
        return ResponseEntity.ok(responseDto);
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
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    private final UserService userService;

    public PaymentController(PaymentService paymentService, UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @PostMapping("/{id}/paypal-order")
    public ResponseEntity<?> createPaypalOrder(@PathVariable Long id) {
        Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Pago no encontrado"));
        }
        Payment payment = paymentOpt.get();
        try {
            // Leer credenciales y URL de PayPal desde application.properties
            String clientId = paypalClientId;
            String clientSecret = paypalClientSecret;
            String baseUrl = paypalBaseUrl;

            // 1. Obtener access token
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            tokenHeaders.setBasicAuth(clientId, clientSecret);
            HttpEntity<String> tokenEntity = new HttpEntity<>("grant_type=client_credentials", tokenHeaders);
            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.postForEntity(baseUrl + "/v1/oauth2/token", tokenEntity, (Class<Map<String, Object>>)(Class<?>)Map.class);
            String accessToken = tokenResponse.getBody() != null ? (String) tokenResponse.getBody().get("access_token") : null;
            if (accessToken == null) {
                return ResponseEntity.status(500).body(Map.of("error", "No se pudo obtener el access token de PayPal"));
            }

            // 2. Crear la orden de pago
            HttpHeaders orderHeaders = new HttpHeaders();
            orderHeaders.setContentType(MediaType.APPLICATION_JSON);
            orderHeaders.setBearerAuth(accessToken);

            Map<String, Object> purchaseUnit = Map.of(
                "amount", Map.of(
                    "currency_code", "USD",
                    "value", String.format(java.util.Locale.US, "%.2f", payment.getAmount())
                ),
                "description", payment.getConcept()
            );
            Map<String, Object> orderBody = Map.of(
                "intent", "CAPTURE",
                "purchase_units", List.of(purchaseUnit),
                "application_context", Map.of(
                    "return_url", "http://localhost:5173/success",
                    "cancel_url", "http://localhost:5173/cancel"
                )
            );
            HttpEntity<Map<String, Object>> orderEntity = new HttpEntity<>(orderBody, orderHeaders);
            ResponseEntity<Map<String, Object>> orderResponse = restTemplate.postForEntity(baseUrl + "/v2/checkout/orders", orderEntity, (Class<Map<String, Object>>)(Class<?>)Map.class);
            Object linksObj = orderResponse.getBody() != null ? orderResponse.getBody().get("links") : null;
            String approvalUrl = null;
            if (linksObj instanceof List<?> linksList) {
                for (Object link : linksList) {
                    if (link instanceof Map<?,?> linkMap && "approve".equals(linkMap.get("rel"))) {
                        approvalUrl = (String) linkMap.get("href");
                        break;
                    }
                }
            }
            if (approvalUrl != null) {
                return ResponseEntity.ok(Map.of("approvalUrl", approvalUrl));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "No se pudo obtener el approvalUrl de PayPal"));
            }
        } catch (Exception e) {
            logger.error("Error creando orden PayPal", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error creando orden PayPal: " + e.getMessage()));
        }
    }

    // Obtener todos los pagos
    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        List<PaymentDTO> dtos = payments.stream().map(payment -> {
            PaymentDTO dto = new PaymentDTO();
            dto.setId(payment.getId());
            dto.setAmount(payment.getAmount());
            dto.setConcept(payment.getConcept());
            dto.setStatus(payment.getStatus());
            dto.setInvoiceNumber(payment.getInvoiceNumber());
            dto.setPaidDate(payment.getPaidDate() != null ? payment.getPaidDate().toString() : null);
            dto.setDueDate(payment.getDate() != null ? payment.getDate().toString() : null);
            if (payment.getUser() != null) {
                dto.setStudentName(payment.getUser().getName());
                dto.setStudentId(payment.getUser().getId());
            }
            return dto;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    // Obtener pagos por usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByUser(@PathVariable Long userId) {
        List<Payment> payments = paymentService.getPaymentsByUserId(userId);
        List<PaymentDTO> dtos = payments.stream().map(payment -> {
            PaymentDTO dto = new PaymentDTO();
            dto.setId(payment.getId());
            dto.setAmount(payment.getAmount());
            dto.setConcept(payment.getConcept());
            dto.setStatus(payment.getStatus());
            dto.setInvoiceNumber(payment.getInvoiceNumber());
            dto.setPaidDate(payment.getPaidDate() != null ? payment.getPaidDate().toString() : null);
            dto.setDueDate(payment.getDate() != null ? payment.getDate().toString() : null);
            if (payment.getUser() != null) {
                dto.setStudentName(payment.getUser().getName());
                dto.setStudentId(payment.getUser().getId());
            }
            return dto;
        }).toList();
        return ResponseEntity.ok(dtos);
    }
    // ...otros métodos originales aquí...

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

    // ...otros métodos originales aquí...
}
