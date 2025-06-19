import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Payment, PaymentStatus } from '../types';
import { MOCK_PAYMENTS } from '../constants';
import { getPaymentsByUser } from '../services/paymentService';
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

  useEffect(() => {
    const fetchPayments = async () => {
      if (currentUser && currentUser.id) {
        try {
          const pagos = await getPaymentsByUser(currentUser.id);
          setPayments(pagos);
        } catch (e) {
          setPayments([]); // O mantener los pagos previos si falla
        }
      } else {
        setPayments([]);
      }
    };
    fetchPayments();
  }, [currentUser]);

  const updatePaymentStatus = useCallback((paymentId: string, newStatus: PaymentStatus) => {
    setPayments(prevPayments =>
      prevPayments.map(p =>
        p.id === paymentId ? { ...p, status: newStatus, paidDate: newStatus === PaymentStatus.Paid ? new Date().toISOString().split('T')[0] : p.paidDate } : p
      )
    );
  }, []);

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
