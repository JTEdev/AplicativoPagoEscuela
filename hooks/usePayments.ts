import { useState, useEffect } from 'react';
import { getPaymentsByUser, updatePayment } from '../services/paymentService';
import { Payment, PaymentStatus } from '../types';

export function usePayments(userId: string | number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const fetchedPayments = await getPaymentsByUser(userId);
        setPayments(fetchedPayments);
      } catch (err) {
        console.error('Error al obtener pagos:', err);
        setError('Error al obtener pagos');
      } finally {
        setLoading(false);
      }
    }

    fetchPayments();
  }, [userId]);

  async function markPaymentAsPaid(paymentId: string | number) {
    try {
      const updatedPayment = await updatePayment(paymentId, { status: PaymentStatus.Paid });
      setPayments((prevPayments) =>
        prevPayments.map((payment) =>
          payment.id === paymentId ? updatedPayment : payment
        )
      );
    } catch (err) {
      console.error('Error al actualizar el pago:', err);
      setError('Error al actualizar el pago');
    }
  }

  return { payments, loading, error, markPaymentAsPaid };
}