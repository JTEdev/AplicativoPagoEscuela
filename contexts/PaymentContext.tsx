import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Payment, PaymentStatus } from '../types';
import { MOCK_PAYMENTS } from '../constants';
import { getPaymentsByUser, updatePayment } from '../services/paymentService';
import { useAuth } from './AuthContext';

interface PaymentContextType {
  payments: Payment[];
  updatePaymentStatus: (paymentId: string, newStatus: PaymentStatus) => void;
  getPaymentById: (paymentId: string) => Payment | undefined;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const { currentUser } = useAuth();

  const fetchPayments = useCallback(async () => {
    if (currentUser && currentUser.id) {
      try {
        const pagos = await getPaymentsByUser(currentUser.id);
        setPayments(pagos);
      } catch (e) {
        setPayments([]);
      }
    } else {
      setPayments([]);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPayments();
  }, [currentUser, fetchPayments]);

  const updatePaymentStatus = useCallback(async (paymentId: string, newStatus: PaymentStatus) => {
    setPayments(prevPayments =>
      prevPayments.map(p =>
        p.id === paymentId ? { ...p, status: newStatus, paidDate: newStatus === PaymentStatus.Paid ? new Date().toISOString().split('T')[0] : p.paidDate } : p
      )
    );
    // Actualizar en backend
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        await updatePayment(paymentId, {
          ...payment,
          status: newStatus,
          paidDate: newStatus === PaymentStatus.Paid ? new Date().toISOString().split('T')[0] : payment.paidDate
        });
        // Refrescar pagos desde backend
        await fetchPayments();
      }
    } catch (e) {
      // Manejo de error opcional
    }
  }, [payments, fetchPayments]);

  const getPaymentById = useCallback((paymentId: string) => {
    return payments.find(p => p.id === paymentId);
  }, [payments]);

  return (
    <PaymentContext.Provider value={{ payments, updatePaymentStatus, getPaymentById }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
};
