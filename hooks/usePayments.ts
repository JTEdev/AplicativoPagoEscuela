import { useState, useEffect } from 'react';
import { getPaymentsByUser, markPaymentAsPaid as markPaidService } from '../services/paymentService';
import { Payment, PaymentStatus } from '../types';

export function usePayments(userId: string | number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
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
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function markPaymentAsPaid(paymentId: string | number) {
    try {
      const updatedPayment = await markPaidService(paymentId);
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

  return { payments, loading, error, markPaymentAsPaid, refreshPayments: fetchPayments };
}