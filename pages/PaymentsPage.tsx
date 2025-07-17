import React, { useState } from 'react';
import { API_URL } from '../services/paymentService';
import Card from '../components/ui/Card';
import PaymentRow from '../components/PaymentRow';
import { usePayments } from '../hooks/usePayments';
import { PaymentStatus } from '../types';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

const PaymentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { payments, markPaymentAsPaid, refreshPayments } = usePayments(currentUser?.id || '');
  const { t } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const pendingPayments = payments.filter(
    p => {
      const status = (p.status || '').toString().toUpperCase();
      return status !== 'PAGADO' && (status === 'PENDING' || status === 'OVERDUE' || status === 'PENDIENTE'.toUpperCase() || status === 'VENCIDO'.toUpperCase());
    }
  ).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handlePay = async (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setProcessingPaymentId(paymentId);
    try {
      // Llamar al backend para crear la orden de PayPal
      const res = await fetch(`${API_URL}/${paymentId}/paypal-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Error creando la orden de PayPal');
      const data = await res.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
        await markPaymentAsPaid(paymentId); // Actualizar estado después del pago
        await refreshPayments(); // Refrescar lista de pagos pendientes
      } else {
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }
    } catch (err) {
      console.error('Error al procesar el pago:', err);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const totalDue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const selectedPaymentForModal = payments.find(p => p.id === selectedPaymentId);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t('pendingPaymentsTitle')}</h1>
        {pendingPayments.length > 0 && (
          <div className="text-right">
            <p className="text-lg text-gray-600">{t('totalDue')}</p>
            <p className="text-2xl font-bold text-red-600">${totalDue.toFixed(2)}</p>
          </div>
        )}
      </div>

      <Card title={t('outstandingBalances')} bodyClassName="overflow-x-auto">
        {pendingPayments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('concept')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('invoiceNo')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dueDate')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('paidDate')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingPayments.map(payment => (
                <PaymentRow 
                  key={payment.id} 
                  payment={payment.id === processingPaymentId ? {...payment, status: PaymentStatus.Processing} : payment} 
                  onPay={handlePay} 
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-gray-700">{t('allPaymentsUpToDate')}</p>
            <p className="text-gray-500">{t('noPendingOrOverdue')}</p>
          </div>
        )}
      </Card>

      {showConfirmation && selectedPaymentForModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <Card title={t('confirmPayment')} className="w-full max-w-md">
            <p className="text-gray-700 mb-4">
              {t('confirmPayMessage', { amount: selectedPaymentForModal.amount.toFixed(2), concept: selectedPaymentForModal.concept })}
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowConfirmation(false)}>{t('cancel')}</Button>
              {/* <Button variant="success" onClick={confirmPayment}>{t('confirmAndPay')}</Button> */}
            </div>
          </Card>
        </div>
      )}

      {processingPaymentId && !showConfirmation && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <Card className="w-full max-w-md text-center">
                <LoadingSpinner text={t('processingPayment')} size="lg" />
                <p className="mt-4 text-gray-600">{t('pleaseWaitPayment')}</p>
            </Card>
         </div>
      )}
    </div>
  );
};

export default PaymentsPage;
