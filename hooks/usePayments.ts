import { useState, useEffect, useCallback } from 'react';
import * as paymentService from '../services/paymentService';
import { Payment } from '../types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = async (payment: any) => {
    await paymentService.createPayment(payment);
    await fetchPayments();
  };

  const updatePayment = async (id: string, payment: any) => {
    await paymentService.updatePayment(id, payment);
    await fetchPayments();
  };

  const deletePayment = async (id: string) => {
    await paymentService.deletePayment(id);
    await fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  };
}
