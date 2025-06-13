import { Payment } from '../types';

const API_URL = 'http://localhost:8080/api/payments';

export async function getAllPayments(): Promise<Payment[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener pagos');
  return res.json();
}

export async function getPaymentsByUser(userId: string | number): Promise<Payment[]> {
  const res = await fetch(`${API_URL}/user/${userId}`);
  if (!res.ok) throw new Error('Error al obtener pagos del usuario');
  return res.json();
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
