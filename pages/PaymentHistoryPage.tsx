
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import PaymentRow from '../components/PaymentRow';
import { usePayments } from '../contexts/PaymentContext';
import { PaymentStatus, Payment } from '../types';
import Button from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation'; // Import useTranslation

const PaymentHistoryPage: React.FC = () => {
  const { payments } = usePayments();
  const { t } = useTranslation(); // Use translation hook
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);

  const paidPayments = payments
    .filter(p => p.status === PaymentStatus.Paid)
    .sort((a,b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime());

  const handleViewReceipt = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setSelectedPaymentForReceipt(payment);
      setShowReceiptModal(true);
    }
  };
  
  const formatDateForReceipt = (dateString?: string) => {
    if (!dateString) return t('na');
    // Ensure consistent formatting for receipt, locale might be handled by browser/OS settings for date
    return new Date(dateString).toLocaleString(t('language') === 'es' ? 'es-ES' : 'en-US', { 
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t('paymentHistory')}</h1>
      <Card title={t('completedTransactions')} bodyClassName="overflow-x-auto">
        {paidPayments.length > 0 ? (
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
              {paidPayments.map(payment => (
                <PaymentRow key={payment.id} payment={payment} onViewReceipt={handleViewReceipt} />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.123 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V9a.75.75 0 01-.75.75H5.625a.75.75 0 01-.75-.75V7.5m7.5 0V9A.75.75 0 0018.375 9H19.5a.75.75 0 00.75-.75V7.5M3 13.5h18M3 13.5v-1.5A2.25 2.25 0 015.25 9.75h13.5A2.25 2.25 0 0121 12v1.5" />
            </svg>
            <p className="text-xl font-semibold text-gray-700">{t('noPaymentHistoryFound')}</p>
            <p className="text-gray-500">{t('noPaymentsMade')}</p>
          </div>
        )}
      </Card>

      {showReceiptModal && selectedPaymentForReceipt && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <Card title={t('paymentReceipt')} className="w-full max-w-lg bg-white" bodyClassName="text-gray-700">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-600">{t('paymentSuccessful')}</h2>
                <p className="text-sm text-gray-500">{t('thankYouPayment')}</p>
              </div>
              
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">{t('transactionId')}</p>
                <p className="font-semibold">{`TRANS-${selectedPaymentForReceipt.id.substring(0,8).toUpperCase()}`}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">{t('invoiceNo')}</p>
                <p className="font-semibold">{selectedPaymentForReceipt.invoiceNumber}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">{t('studentName')}</p>
                <p className="font-semibold">{selectedPaymentForReceipt.studentName}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">{t('paymentFor')}</p>
                <p className="font-semibold">{selectedPaymentForReceipt.concept}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">{t('amountPaid')}</p>
                <p className="font-semibold text-green-600 text-lg">${selectedPaymentForReceipt.amount.toFixed(2)}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">{t('datePaid')}</p>
                <p className="font-semibold">{formatDateForReceipt(selectedPaymentForReceipt.paidDate)}</p>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <Button variant="outline" onClick={() => alert('Downloading receipt...')}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    {t('downloadPdf')}
                </Button>
                <Button variant="primary" onClick={() => setShowReceiptModal(false)}>{t('close')}</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
