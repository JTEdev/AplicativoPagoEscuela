export interface PaymentSummary {
  pendingCount: number;
  totalDue: number;
  upcomingCount: number;
  upcomingPayments: Array<{
    id: string | number;
    concept: string;
    amount: number;
    dueDate: string;
    status: string;
  }>;
}

export async function getUserPaymentSummary(userId: string | number): Promise<PaymentSummary> {
  const res = await fetch(`${API_URL}/user/${userId}/summary`);
  if (!res.ok) throw new Error('Error al obtener resumen de pagos del usuario');
  return res.json();
}
export async function markPaymentAsPaid(id: string | number, transactionId?: string): Promise<Payment> {
  const body = transactionId ? JSON.stringify({ transactionId }) : undefined;
  const res = await fetch(`${API_URL}/${id}/mark-paid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  if (!res.ok) throw new Error('Error al marcar pago como pagado');
  return res.json();
}
import { Payment } from '../types';

export const API_URL = 'http://localhost:8080/api/payments';

export async function getAllPayments(): Promise<Payment[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener pagos');
  const pagos = await res.json();
  return pagos.map((p: any) => ({ ...p, userId: p.studentId }));
}

export async function getPaymentsByUser(userId: string | number): Promise<Payment[]> {
  const res = await fetch(`${API_URL}/user/${userId}`);
  if (!res.ok) throw new Error('Error al obtener pagos del usuario');
  const pagos = await res.json();
  // Asegura que dueDate esté presente y en formato string
  return pagos.map((p: any) => ({
    ...p,
    userId: p.studentId,
    dueDate: p.dueDate || p.date || '',
  }));
}

export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment)
  });
  if (!res.ok) throw new Error('Error al crear pago');
  return res.json();
}

export async function updatePayment(id: string | number, payment: Partial<Payment>): Promise<Payment> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment)
  });
  if (!res.ok) throw new Error('Error al actualizar pago');
  return res.json();
}

export async function deletePayment(id: string | number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar pago');
}
