import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentStatus } from '../../types';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import * as paymentService from '../../services/paymentService';

const getStatusClass = (status: string) => {
  switch (status?.toString().toUpperCase()) {
    case 'PAID':
    case 'PAGADO':
      return 'bg-green-100 text-green-700';
    case 'PENDING':
    case 'PENDIENTE':
      return 'bg-yellow-100 text-yellow-700';
    case 'OVERDUE':
    case 'VENCIDO':
      return 'bg-red-100 text-red-700';
    case 'PROCESSING':
    case 'PROCESANDO':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const AdminDashboardPage: React.FC = () => {
  const { currentUser, users } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    paymentService.getAllPayments().then(setPayments);
  }, []);

  const totalPaymentsCount = payments.length;
  const totalAmountCollected = payments
    .filter(p => p.status === PaymentStatus.Paid)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUsers = users.length;

  const StatCard: React.FC<{ titleKey: string, value: string | number, icon: React.ReactNode, color: string, linkTo?: string }> = ({ titleKey, value, icon, color, linkTo }) => {
    const content = (
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium uppercase tracking-wider">{t(titleKey)}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
    if (linkTo) {
        return <Link to={linkTo}><Card className={`shadow-md ${color} text-white hover:opacity-90 transition-opacity`}>{content}</Card></Link>;
    }
    return <Card className={`shadow-md ${color} text-white`}>{content}</Card>;
  };

  const recentPaymentsPreview = [...payments]
    .sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t('adminDashboard')}</h1>
      <p className="text-gray-600">{t('adminDashboardWelcome', { name: currentUser?.name || t('admin') })}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/all-payments" className="block">
          <Card className="bg-purple-500 text-white shadow-md cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
                {/* Icono de pagos */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 19.875v-6.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125V3.75A1.125 1.125 0 014.125 2.625h15.75A1.125 1.125 0 0121 3.75v9.375m-13.5-3.063V6.375m4.5 3.688V6.375m4.5 3.688V6.375" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider">{t('totalPaymentsRecorded')}</p>
                <p className="text-2xl font-bold">{totalPaymentsCount}</p>
              </div>
            </div>
          </Card>
        </Link>
        <Card className="bg-green-500 text-white shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
              {/* Icono de dinero */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536.219-2.121.727l-.879.659z" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-wider">{t('totalAmountCollected')}</p>
              <p className="text-2xl font-bold">${totalAmountCollected.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Link to="/admin/user-management" className="block">
          <Card className="bg-indigo-500 text-white shadow-md cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
                {/* Icono de usuarios */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-wider">{t('registeredUsers')}</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <Card title={t('recentPaymentsOverview')} bodyClassName="overflow-x-auto">
        {recentPaymentsPreview.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('studentName')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('concept')}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dueDate')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPaymentsPreview.map(payment => (
                  <tr key={payment.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.concept}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">${payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                            {t(payment.status.toLowerCase() as any)}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(payment.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-right">
                <Link to="/admin/all-payments">
                    <Button variant="outline" size="sm">{t('viewAllPayments')}</Button>
                </Link>
            </div>
          </>
        ) : (
          <p className="text-gray-600 p-4">{t('noPaymentsRecordedYet')}</p>
        )}
      </Card>

      <Card title={t('userManagementOverview')}>
        <p className="text-gray-600">
            {t('userManagementSummary', { count: totalUsers })}
        </p>
        <p className="text-sm text-gray-500 mt-1">
            {t('userManagementInfo')}
        </p>
        <div className="mt-4">
            <Link to="/admin/user-management">
                <Button variant="primary">{t('goToUserManagement')}</Button>
            </Link>
        </div>
      </Card>

    </div>
  );
};

export default AdminDashboardPage;
