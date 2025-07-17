
package com.aplicativopagoescuela.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.aplicativopagoescuela.backend.model.Payment;
import com.aplicativopagoescuela.backend.service.PaymentService;
import com.aplicativopagoescuela.backend.service.UserService;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<?> markPaymentAsPaid(@PathVariable Long id) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Pago no encontrado"));
            }
            Payment payment = paymentOpt.get();
            payment.setStatus("PAID");
            if (payment.getPaidDate() == null) {
                payment.setPaidDate(LocalDate.now());
            }
            paymentService.savePayment(payment);
            // Devolver DTO actualizado
            var dto = new com.aplicativopagoescuela.backend.controller.dto.PaymentDTO();
            dto.setId(payment.getId());
            dto.setStudentId(payment.getUser() != null ? payment.getUser().getId() : null);
            dto.setStudentName(payment.getUser() != null ? payment.getUser().getName() : "N/A");
            dto.setGrade(payment.getUser() != null ? payment.getUser().getGrade() : payment.getGrade());
            dto.setConcept(payment.getConcept());
            dto.setAmount(payment.getAmount());
            dto.setDueDate(payment.getDate() != null ? payment.getDate().toString() : null);
            dto.setPaidDate(payment.getPaidDate() != null ? payment.getPaidDate().toString() : null);
            String statusEs = switch (payment.getStatus()) {
                case "PAID" -> "Pagado";
                case "PENDING" -> "Pendiente";
                case "OVERDUE" -> "Vencido";
                case "PROCESSING" -> "Procesando";
                default -> payment.getStatus();
            };
            dto.setStatus(statusEs);
            dto.setInvoiceNumber(payment.getInvoiceNumber());
            dto.setTransactionId(payment.getTransactionId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error marcando pago como pagado", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error marcando pago como pagado"));
        }
    }
    @PostMapping("/{id}/paypal-order")
public ResponseEntity<?> createPaypalOrder(@PathVariable Long id) {
    try {
        Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Pago no encontrado"));
        }
        Payment payment = paymentOpt.get();
        String clientId = paypalClientId;
        String clientSecret = paypalClientSecret;
        String baseUrl = paypalBaseUrl;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        tokenHeaders.setBasicAuth(clientId, clientSecret);
        org.springframework.http.HttpEntity<String> tokenEntity = new org.springframework.http.HttpEntity<>("grant_type=client_credentials", tokenHeaders);
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(baseUrl + "/v1/oauth2/token", tokenEntity, Map.class);
        String accessToken = tokenResponse.getBody() != null ? (String) tokenResponse.getBody().get("access_token") : null;
        if (accessToken == null) {
            System.err.println("[PayPal] No se pudo obtener el access token de PayPal");
            return ResponseEntity.status(500).body(Map.of("error", "No se pudo obtener el access token de PayPal"));
        }

        HttpHeaders orderHeaders = new HttpHeaders();
        orderHeaders.setContentType(MediaType.APPLICATION_JSON);
        orderHeaders.setBearerAuth(accessToken);
        Map<String, Object> orderBody = Map.of(
            "intent", "CAPTURE",
            "purchase_units", java.util.List.of(Map.of(
                "amount", Map.of(
                    "currency_code", "USD",
                    "value", payment.getAmount() != null ? String.format(java.util.Locale.US, "%.2f", payment.getAmount()) : "0.00"
                ),
                "description", payment.getConcept()
            )),
            "application_context", Map.of(
                "return_url", "http://localhost:5173/success?paymentId=" + payment.getId(),
                "cancel_url", "http://localhost:5173/payments"
            )
        );
        org.springframework.http.HttpEntity<Map<String, Object>> orderEntity = new org.springframework.http.HttpEntity<>(orderBody, orderHeaders);
        ResponseEntity<Map> orderResponse = null;
        try {
            orderResponse = restTemplate.postForEntity(baseUrl + "/v2/checkout/orders", orderEntity, Map.class);
        } catch (Exception ex) {
            logger.error("Respuesta de error de PayPal:", ex);
            System.err.println("[PayPal] Excepción al crear la orden: " + ex.getMessage());
            if (ex instanceof org.springframework.web.client.HttpStatusCodeException) {
                String responseBody = ((org.springframework.web.client.HttpStatusCodeException) ex).getResponseBodyAsString();
                System.err.println("[PayPal] Cuerpo de respuesta: " + responseBody);
            }
            return ResponseEntity.status(500).body(Map.of("error", "Error PayPal: " + ex.getMessage()));
        }
        if (orderResponse.getBody() == null || !orderResponse.getBody().containsKey("links")) {
            logger.error("Respuesta de PayPal sin links: {}", orderResponse.getBody());
            System.err.println("[PayPal] Respuesta sin links: " + orderResponse.getBody());
            return ResponseEntity.status(500).body(Map.of("error", "No se pudo crear la orden de PayPal", "paypalResponse", orderResponse.getBody()));
        }
        String approvalUrl = null;
        java.util.List<Map<String, Object>> links = (java.util.List<Map<String, Object>>) orderResponse.getBody().get("links");
        for (Map<String, Object> link : links) {
            if ("approve".equals(link.get("rel"))) {
                approvalUrl = (String) link.get("href");
                break;
            }
        }
        if (approvalUrl == null) {
            logger.error("No se encontró approval_url en links: {}", links);
            System.err.println("[PayPal] No se encontró approval_url en links: " + links);
            return ResponseEntity.status(500).body(Map.of("error", "No se encontró la URL de aprobación de PayPal", "paypalLinks", links));
        }
        return ResponseEntity.ok(Map.of("approvalUrl", approvalUrl));
    } catch (Exception e) {
        logger.error("Error creando orden de PayPal", e);
        System.err.println("[PayPal] Error creando orden de PayPal: " + e.getMessage());
        if (e instanceof org.springframework.web.client.HttpStatusCodeException) {
            String responseBody = ((org.springframework.web.client.HttpStatusCodeException) e).getResponseBodyAsString();
            System.err.println("[PayPal] Cuerpo de respuesta: " + responseBody);
        }
        return ResponseEntity.status(500).body(Map.of("error", "Error creando la orden de PayPal: " + e.getMessage()));
    }
}
    @PostMapping("")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> body) {
        try {
            Payment payment = new Payment();
            if (body.containsKey("concept")) payment.setConcept((String) body.get("concept"));
            if (body.containsKey("amount")) payment.setAmount(Double.valueOf(body.get("amount").toString()));
            // Validar fecha de vencimiento
            String dateStr = body.containsKey("dueDate") ? (String) body.get("dueDate") : null;
            if (dateStr == null || dateStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La fecha de vencimiento es obligatoria"));
            }
            payment.setDate(LocalDate.parse(dateStr));
            if (body.containsKey("paidDate")) {
                String paidDateStr = (String) body.get("paidDate");
                payment.setPaidDate(paidDateStr != null && !paidDateStr.isEmpty() ? LocalDate.parse(paidDateStr) : null);
            }
            if (body.containsKey("status")) {
                String newStatus = (String) body.get("status");
                String normalizedStatus = "";
                if (newStatus != null) {
                    String statusTrimmed = newStatus.trim().toUpperCase();
                    switch (statusTrimmed) {
                        case "PAGADO":
                        case "PAID":
                            normalizedStatus = "PAID";
                            break;
                        case "PENDIENTE":
                        case "PENDING":
                            normalizedStatus = "PENDING";
                            break;
                        case "VENCIDO":
                        case "OVERDUE":
                            normalizedStatus = "OVERDUE";
                            break;
                        case "PROCESANDO":
                        case "PROCESSING":
                            normalizedStatus = "PROCESSING";
                            break;
                        default:
                            normalizedStatus = statusTrimmed;
                    }
                }
                payment.setStatus(normalizedStatus);
                if (normalizedStatus.equals("PAID")) {
                    if (payment.getPaidDate() == null) {
                        payment.setPaidDate(LocalDate.now());
                    }
                } else {
                    payment.setPaidDate(null);
                }
            }
            if (body.containsKey("invoiceNumber")) payment.setInvoiceNumber((String) body.get("invoiceNumber"));
            if (body.containsKey("transactionId")) payment.setTransactionId((String) body.get("transactionId"));
            if (body.containsKey("grade")) payment.setGrade((String) body.get("grade"));
            if (body.containsKey("studentId")) {
                Object studentIdObj = body.get("studentId");
                if (studentIdObj != null) {
                    Long studentId = Long.valueOf(studentIdObj.toString());
                    var userOpt = userService.getUserById(studentId);
                    if (userOpt.isPresent()) {
                        payment.setUser(userOpt.get());
                    }
                }
            }
            paymentService.savePayment(payment);
            // Devolver DTO creado
            var dto = new com.aplicativopagoescuela.backend.controller.dto.PaymentDTO();
            dto.setId(payment.getId());
            dto.setStudentId(payment.getUser() != null ? payment.getUser().getId() : null);
            dto.setStudentName(payment.getUser() != null ? payment.getUser().getName() : "N/A");
            dto.setGrade(payment.getUser() != null ? payment.getUser().getGrade() : payment.getGrade());
            dto.setConcept(payment.getConcept());
            dto.setAmount(payment.getAmount());
            dto.setDueDate(payment.getDate() != null ? payment.getDate().toString() : null);
            dto.setPaidDate(payment.getPaidDate() != null ? payment.getPaidDate().toString() : null);
            String statusEs = switch (payment.getStatus()) {
                case "PAID" -> "Pagado";
                case "PENDING" -> "Pendiente";
                case "OVERDUE" -> "Vencido";
                case "PROCESSING" -> "Procesando";
                default -> payment.getStatus();
            };
            dto.setStatus(statusEs);
            dto.setInvoiceNumber(payment.getInvoiceNumber());
            dto.setTransactionId(payment.getTransactionId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error creando pago", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error creando pago"));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
            if (paymentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Pago no encontrado"));
            }
            Payment payment = paymentOpt.get();
            if (body.containsKey("concept")) payment.setConcept((String) body.get("concept"));
            if (body.containsKey("amount")) payment.setAmount(Double.valueOf(body.get("amount").toString()));
            if (body.containsKey("dueDate")) {
                String dateStr = (String) body.get("dueDate");
                payment.setDate(dateStr != null && !dateStr.isEmpty() ? LocalDate.parse(dateStr) : null);
            }
            boolean paidDateSent = false;
            if (body.containsKey("paidDate")) {
                String paidDateStr = (String) body.get("paidDate");
                payment.setPaidDate(paidDateStr != null && !paidDateStr.isEmpty() ? LocalDate.parse(paidDateStr) : null);
                paidDateSent = paidDateStr != null && !paidDateStr.isEmpty();
            }
            if (body.containsKey("status")) {
                String newStatus = (String) body.get("status");
                String normalizedStatus = "";
                if (newStatus != null) {
                    String statusTrimmed = newStatus.trim().toUpperCase();
                    // Normalizar español/inglés a inglés
                    switch (statusTrimmed) {
                        case "PAGADO":
                        case "PAID":
                            normalizedStatus = "PAID";
                            break;
                        case "PENDIENTE":
                        case "PENDING":
                            normalizedStatus = "PENDING";
                            break;
                        case "VENCIDO":
                        case "OVERDUE":
                            normalizedStatus = "OVERDUE";
                            break;
                        case "PROCESANDO":
                        case "PROCESSING":
                            normalizedStatus = "PROCESSING";
                            break;
                        default:
                            normalizedStatus = statusTrimmed;
                    }
                }
                logger.info("[Pago] Estado recibido: {} | Estado guardado: {}", newStatus, normalizedStatus);
                payment.setStatus(normalizedStatus); // Guardar SIEMPRE en inglés
                if (normalizedStatus.equals("PAID")) {
                    // Si no se envió paidDate, asignar fecha actual
                    if (!paidDateSent && payment.getPaidDate() == null) {
                        payment.setPaidDate(LocalDate.now());
                    }
                } else {
                    payment.setPaidDate(null);
                }
            }
            if (body.containsKey("invoiceNumber")) payment.setInvoiceNumber((String) body.get("invoiceNumber"));
            if (body.containsKey("transactionId")) payment.setTransactionId((String) body.get("transactionId"));
            if (body.containsKey("grade")) payment.setGrade((String) body.get("grade"));
            // Actualizar usuario si se envía studentId
            if (body.containsKey("studentId")) {
                Object studentIdObj = body.get("studentId");
                if (studentIdObj != null) {
                    Long studentId = Long.valueOf(studentIdObj.toString());
                    var userOpt = userService.getUserById(studentId);
                    if (userOpt.isPresent()) {
                        payment.setUser(userOpt.get());
                    }
                }
            }
            paymentService.savePayment(payment);
            // Devolver DTO actualizado
            var dto = new com.aplicativopagoescuela.backend.controller.dto.PaymentDTO();
            dto.setId(payment.getId());
            dto.setStudentId(payment.getUser() != null ? payment.getUser().getId() : null);
            dto.setStudentName(payment.getUser() != null ? payment.getUser().getName() : "N/A");
            dto.setGrade(payment.getUser() != null ? payment.getUser().getGrade() : payment.getGrade());
            dto.setConcept(payment.getConcept());
            dto.setAmount(payment.getAmount());
            dto.setDueDate(payment.getDate() != null ? payment.getDate().toString() : null);
            dto.setPaidDate(payment.getPaidDate() != null ? payment.getPaidDate().toString() : null);
            // Traducir estado a español para el frontend
            String statusEs = switch (payment.getStatus()) {
                case "PAID" -> "Pagado";
                case "PENDING" -> "Pendiente";
                case "OVERDUE" -> "Vencido";
                case "PROCESSING" -> "Procesando";
                default -> payment.getStatus();
            };
            dto.setStatus(statusEs);
            dto.setInvoiceNumber(payment.getInvoiceNumber());
            dto.setTransactionId(payment.getTransactionId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.error("Error actualizando pago", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error actualizando pago"));
        }
    }
    @GetMapping("")
    public ResponseEntity<?> getAllPayments() {
        try {
            var payments = paymentService.getAllPayments();
            var dtos = payments.stream().map(p -> {
                var dto = new com.aplicativopagoescuela.backend.controller.dto.PaymentDTO();
                dto.setId(p.getId());
                dto.setStudentId(p.getUser() != null ? p.getUser().getId() : null);
                dto.setStudentName(p.getUser() != null ? p.getUser().getName() : "N/A");
                dto.setGrade(p.getUser() != null ? p.getUser().getGrade() : p.getGrade());
                dto.setConcept(p.getConcept());
                dto.setAmount(p.getAmount());
                dto.setDueDate(p.getDate() != null ? p.getDate().toString() : null);
                dto.setPaidDate(p.getPaidDate() != null ? p.getPaidDate().toString() : null);
                // Traducir estado a español para el frontend
                String statusEs = switch (p.getStatus()) {
                    case "PAID" -> "Pagado";
                    case "PENDING" -> "Pendiente";
                    case "OVERDUE" -> "Vencido";
                    case "PROCESSING" -> "Procesando";
                    default -> p.getStatus();
                };
                dto.setStatus(statusEs);
                dto.setInvoiceNumber(p.getInvoiceNumber());
                dto.setTransactionId(p.getTransactionId());
                return dto;
            }).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error obteniendo todos los pagos", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error obteniendo todos los pagos"));
        }
    }
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    private final UserService userService;

    @Value("${paypal.client-id}")
    private String paypalClientId;
    @Value("${paypal.client-secret}")
    private String paypalClientSecret;
    @Value("${paypal.base-url}")
    private String paypalBaseUrl;

    public PaymentController(PaymentService paymentService, UserService userService) {
        this.paymentService = paymentService;
        this.userService = userService;
    }

    @GetMapping("/{id}/paypal-capture")
    public ResponseEntity<?> capturePaypalPayment(@PathVariable Long id, @RequestParam("token") String orderId) {
        logger.info("[PayPal] Iniciando captura de pago para PaymentId: {} con orderId: {}", id, orderId);
        Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
        if (paymentOpt.isEmpty()) {
            logger.error("[PayPal] Pago no encontrado para id: {}", id);
            return ResponseEntity.status(404).body(Map.of("error", "Pago no encontrado"));
        }
        Payment payment = paymentOpt.get();
        try {
            String clientId = paypalClientId;
            String clientSecret = paypalClientSecret;
            String baseUrl = paypalBaseUrl;

            // 1. Obtener access token
            logger.info("[PayPal] Obteniendo access token de PayPal...");
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            tokenHeaders.setBasicAuth(clientId, clientSecret);
            org.springframework.http.HttpEntity<String> tokenEntity = new org.springframework.http.HttpEntity<>("grant_type=client_credentials", tokenHeaders);
            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.postForEntity(baseUrl + "/v1/oauth2/token", tokenEntity, (Class<Map<String, Object>>)(Class<?>)Map.class);
            String accessToken = tokenResponse.getBody() != null ? (String) tokenResponse.getBody().get("access_token") : null;
            if (accessToken == null) {
                logger.error("[PayPal] No se pudo obtener el access token de PayPal");
                return ResponseEntity.status(500).body(Map.of("error", "No se pudo obtener el access token de PayPal"));
            }

            // 2. Capturar el pago
            logger.info("[PayPal] Capturando pago en PayPal para orderId: {}", orderId);
            HttpHeaders captureHeaders = new HttpHeaders();
            captureHeaders.setContentType(MediaType.APPLICATION_JSON);
            captureHeaders.setBearerAuth(accessToken);
            org.springframework.http.HttpEntity<Void> captureEntity = new org.springframework.http.HttpEntity<>(captureHeaders);
            ResponseEntity<Map<String, Object>> captureResponse = restTemplate.postForEntity(baseUrl + "/v2/checkout/orders/" + orderId + "/capture", captureEntity, (Class<Map<String, Object>>)(Class<?>)Map.class);
            logger.info("[PayPal] Respuesta de captura: {}", captureResponse.getBody());

            // Extraer transactionId de la respuesta
            String transactionId = null;
            if (captureResponse.getBody() != null && captureResponse.getBody().containsKey("purchase_units")) {
                logger.info("[PayPal] Procesando purchase_units para obtener transactionId...");
                Object purchaseUnitsObj = captureResponse.getBody().get("purchase_units");
                if (purchaseUnitsObj instanceof java.util.List<?> purchaseUnitsList && !purchaseUnitsList.isEmpty()) {
                    Object pu = purchaseUnitsList.get(0);
                    if (pu instanceof Map<?,?> puMap && puMap.containsKey("payments")) {
                        Object paymentsObj = puMap.get("payments");
                        if (paymentsObj instanceof Map<?,?> paymentsMap && paymentsMap.containsKey("captures")) {
                            Object capturesObj = paymentsMap.get("captures");
                            if (capturesObj instanceof java.util.List<?> capturesList && !capturesList.isEmpty()) {
                                Object capture = capturesList.get(0);
                                if (capture instanceof Map<?,?> captureMap && captureMap.containsKey("id")) {
                                    transactionId = (String) captureMap.get("id");
                                }
                            }
                        }
                    }
                }
            }
            if (transactionId != null) {
                logger.info("[PayPal] transactionId obtenido: {}. Guardando en BD...", transactionId);
                payment.setTransactionId(transactionId);
                payment.setStatus("PAID");
                payment.setPaidDate(LocalDate.now());
                paymentService.savePayment(payment);
            } else {
                logger.warn("[PayPal] No se obtuvo transactionId en la respuesta de captura.");
            }
            // Redirigir al frontend con los parámetros necesarios
            String redirectUrl = "http://localhost:5173/success?paymentId=" + payment.getId() + "&transactionId=" + (transactionId != null ? transactionId : "");
            logger.info("[PayPal] Redirigiendo a frontend: {}", redirectUrl);
            return ResponseEntity.status(302).header("Location", redirectUrl).build();
        } catch (Exception e) {
            logger.error("Error capturando pago PayPal", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error capturando pago PayPal: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPaymentsByUser(@PathVariable Long userId) {
        try {
            var payments = paymentService.getPaymentsByUserId(userId);
            var dtos = payments.stream().map(p -> {
                var dto = new com.aplicativopagoescuela.backend.controller.dto.PaymentDTO();
                dto.setId(p.getId());
                dto.setStudentId(p.getUser() != null ? p.getUser().getId() : null);
                dto.setStudentName(p.getUser() != null ? p.getUser().getName() : "N/A");
                dto.setGrade(p.getUser() != null ? p.getUser().getGrade() : p.getGrade());
                dto.setConcept(p.getConcept());
                dto.setAmount(p.getAmount());
                dto.setDueDate(p.getDate() != null ? p.getDate().toString() : null);
                dto.setPaidDate(p.getPaidDate() != null ? p.getPaidDate().toString() : null);
                String statusEs = switch (p.getStatus()) {
                    case "PAID" -> "Pagado";
                    case "PENDING" -> "Pendiente";
                    case "OVERDUE" -> "Vencido";
                    case "PROCESSING" -> "Procesando";
                    default -> p.getStatus();
                };
                dto.setStatus(statusEs);
                dto.setInvoiceNumber(p.getInvoiceNumber());
                dto.setTransactionId(p.getTransactionId());
                return dto;
            }).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error obteniendo pagos del usuario", e);
            return ResponseEntity.status(500).body(Map.of("error", "Error obteniendo pagos del usuario"));
        }
    }
    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<?> getUserPaymentSummary(@PathVariable Long userId) {
        try {
            var payments = paymentService.getPaymentsByUserId(userId);
            int pendingCount = 0;
            double totalDue = 0.0;
            java.time.LocalDate today = java.time.LocalDate.now();
            java.util.List<Payment> upcomingPayments = new java.util.ArrayList<>();
            for (var p : payments) {
                if ("PENDING".equalsIgnoreCase(p.getStatus())) {
                    pendingCount++;
                    totalDue += p.getAmount() != null ? p.getAmount() : 0.0;
                    if (p.getDate() != null && !p.getDate().isBefore(today)) {
                        upcomingPayments.add(p);
                    }
                }
            }
            // Mapear a DTO para no exponer entidades
            java.util.List<java.util.Map<String, Object>> upcomingDTOs = new java.util.ArrayList<>();
            for (var p : upcomingPayments) {
                upcomingDTOs.add(java.util.Map.of(
                    "id", p.getId(),
                    "concept", p.getConcept(),
                    "amount", p.getAmount(),
                    "dueDate", p.getDate() != null ? p.getDate().toString() : null,
                    "status", p.getStatus()
                ));
            }
            java.util.Map<String, Object> summary = java.util.Map.of(
                "pendingCount", pendingCount,
                "totalDue", totalDue,
                "upcomingCount", upcomingDTOs.size(),
                "upcomingPayments", upcomingDTOs
            );
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error obteniendo resumen de pagos del usuario", e);
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error obteniendo resumen de pagos del usuario"));
        }
    }
}
