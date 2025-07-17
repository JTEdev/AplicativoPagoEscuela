import React from 'react';
import { Payment, PaymentStatus } from '../types';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';

interface PaymentRowProps {
  payment: Payment;
  onPay?: (paymentId: string) => void;
  onViewReceipt?: (paymentId: string) => void;
}

const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  let bgColor = '';
  let textColor = '';
  const normalized = status?.toString().toUpperCase();
  if (normalized === 'PAID' || normalized === 'PAGADO') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
  } else if (normalized === 'PENDING' || normalized === 'PENDIENTE') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
  } else if (normalized === 'OVERDUE' || normalized === 'VENCIDO') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
  } else if (normalized === 'PROCESSING' || normalized === 'PROCESANDO') {
    bgColor = 'bg-blue-100';
    textColor = 'text-blue-700';
  } else {
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-700';
  }
  // Mostrar texto traducido
  let text = status;
  if (normalized === 'PAID' || normalized === 'PAGADO') text = t('paid');
  else if (normalized === 'PENDING' || normalized === 'PENDIENTE') text = t('pending');
  else if (normalized === 'OVERDUE' || normalized === 'VENCIDO') text = t('overdue');
  else if (normalized === 'PROCESSING' || normalized === 'PROCESANDO') text = t('processing');
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};


const PaymentRow: React.FC<PaymentRowProps> = ({ payment, onPay, onViewReceipt }) => {
  const { t } = useTranslation();
  const formatDate = (dateString?: string) => {
    if (!dateString) return t('na');
    return new Date(dateString).toLocaleDateString(t('language') === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <tr className="bg-white hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.concept}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.invoiceNumber || t('na')}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">${payment.amount.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(payment.dueDate)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {payment.status === PaymentStatus.Paid ? formatDate(payment.paidDate) : t('na')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {(['PENDING', 'OVERDUE', 'PENDIENTE', 'VENCIDO'].includes((payment.status || '').toString().toUpperCase()) && onPay) && (
          <Button 
            onClick={() => onPay(payment.id)} 
            size="sm" 
            variant={['OVERDUE', 'VENCIDO'].includes((payment.status || '').toString().toUpperCase()) ? "danger" : "primary"}
          >
            {t('makePayment')}
          </Button>
        )}
        {((payment.status || '').toString().toUpperCase() === 'PAID' && onViewReceipt) && (
          <Button onClick={() => onViewReceipt(payment.id)} size="sm" variant="outline">
            {t('viewReceipt')}
          </Button>
        )}
         {payment.status === PaymentStatus.Processing && (
          <Button size="sm" variant="secondary" disabled>
            {t('processing')}...
          </Button>
        )}
      </td>
    </tr>
  );
};

export default PaymentRow;
