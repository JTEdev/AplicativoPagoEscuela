package com.aplicativopagoescuela.backend.controller.dto;

public class PaymentDTO {
    public String studentName;
    public String concept;
    public Double amount;
    public String dueDate; // ISO string
    public String paidDate; // ISO string (opcional)
    public String status;
    public String invoiceNumber;

    @Override
    public String toString() {
        return "PaymentDTO{" +
                "studentName='" + studentName + '\'' +
                ", concept='" + concept + '\'' +
                ", amount=" + amount +
                ", dueDate='" + dueDate + '\'' +
                ", paidDate='" + paidDate + '\'' +
                ", status='" + status + '\'' +
                ", invoiceNumber='" + invoiceNumber + '\'' +
                '}';
    }
}
