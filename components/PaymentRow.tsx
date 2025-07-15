import React from 'react';
import { Payment, PaymentStatus } from '../types';
import Button from './ui/Button';
import { useTranslation } from '../hooks/useTranslation';

interface PaymentRowProps {
  payment: Payment;
  onPay?: (paymentId: string) => void;
  onViewReceipt?: (paymentId: string) => void;
}

const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const { t } = useTranslation();
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case PaymentStatus.Paid:
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case PaymentStatus.Pending:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      break;
    case PaymentStatus.Overdue:
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
    case PaymentStatus.Processing:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
  }

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {t(status.toLowerCase() as any)} {/* Translate status */}
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
