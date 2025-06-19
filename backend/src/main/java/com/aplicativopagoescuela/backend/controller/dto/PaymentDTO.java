package com.aplicativopagoescuela.backend.controller.dto;

public class PaymentDTO {
    private Long studentId; // <-- Agregado para recibir el ID del estudiante
    private String studentName;
    private String concept;
    private Double amount;
    private String dueDate; // ISO string
    private String paidDate; // ISO string (opcional)
    private String status;
    private String invoiceNumber;

    // Getters y setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getConcept() { return concept; }
    public void setConcept(String concept) { this.concept = concept; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getPaidDate() { return paidDate; }
    public void setPaidDate(String paidDate) { this.paidDate = paidDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    @Override
    public String toString() {
        return "PaymentDTO{" +
                "studentId='" + studentId + '\'' +
                ", studentName='" + studentName + '\'' +
                ", concept='" + concept + '\'' +
                ", amount=" + amount +
                ", dueDate='" + dueDate + '\'' +
                ", paidDate='" + paidDate + '\'' +
                ", status='" + status + '\'' +
                ", invoiceNumber='" + invoiceNumber + '\'' +
                '}';
    }
}
