import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { usePayments } from '../contexts/PaymentContext';
import { getUserPaymentSummary } from '../services/paymentService';
import { PaymentStatus, Payment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import SchoolCalendarModal from '../components/ui/SchoolCalendarModal';

type UpcomingPayment = {
  id: string | number;
  concept: string;
  amount: number;
  dueDate: string;
  status: string;
};

type PaymentSummary = {
  pendingCount: number;
  totalDue: number;
  upcomingCount: number;
  upcomingPayments: UpcomingPayment[];
};

const DashboardPage: React.FC = () => {
  const { payments, refreshPayments } = usePayments();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Estado para el resumen del backend
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Refresca el resumen cada vez que cambian los pagos o el usuario
  useEffect(() => {
    const fetchSummary = async () => {
      if (currentUser?.id) {
        setLoadingSummary(true);
        setSummaryError(null);
        try {
          const res = await getUserPaymentSummary(currentUser.id);
          setSummary(res);
        } catch (e) {
          setSummaryError('No se pudo cargar el resumen');
        } finally {
          setLoadingSummary(false);
        }
      }
    };
    fetchSummary();
  }, [currentUser, payments]);

  // Exponer función para forzar sincronización desde otras páginas si es necesario
  const syncPaymentsAndSummary = async () => {
    await refreshPayments();
    if (currentUser?.id) {
      try {
        const res = await getUserPaymentSummary(currentUser.id);
        setSummary(res);
      } catch {}
    }
  };

  // Mantener lógica de pagos para listas (no tarjetas)
  const studentPayments = payments.filter(p => p.studentId == currentUser?.id);
  const pendingPayments = studentPayments.filter(p => {
    const status = (p.status || '').toString().toUpperCase();
    return status === 'PENDING' || status === 'OVERDUE' || status === 'PENDIENTE'.toUpperCase() || status === 'VENCIDO'.toUpperCase();
  });
  const upcomingPayments = pendingPayments
    .filter(p => {
      const status = (p.status || '').toString().toUpperCase();
      return status === 'PENDING' || status === 'PENDIENTE'.toUpperCase();
    })
    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);
  const recentPaidPayments = studentPayments
    .filter(p => {
      const status = (p.status || '').toString().toUpperCase();
      return (status === 'PAID' || status === 'PAGADO') && p.paidDate;
    })
    .sort((a,b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
    .slice(0,3);

  const StatCard: React.FC<{ titleKey: string, value: string | number, icon: React.ReactNode, color: string }> = ({ titleKey, value, icon, color }) => (
    <Card className={`shadow-md ${color} text-white`}>
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium uppercase tracking-wider">{t(titleKey)}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    </Card>
  );

  const QuickLink: React.FC<{ to: string, labelKey: string, icon: React.ReactNode }> = ({ to, labelKey, icon }) => (
    <Link to={to} className="block p-4 bg-white hover:bg-gray-50 rounded-lg shadow text-center transition-colors">
        <div className="flex flex-col items-center">
            <div className="mb-2 text-blue-600">{icon}</div>
            <span className="text-sm font-medium text-gray-700">{t(labelKey)}</span>
        </div>
    </Link>
  );


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{t('welcome')}, {currentUser?.name || t('student')}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          titleKey="pendingPayments"
          value={loadingSummary ? '...' : summaryError ? '!' : summary?.pendingCount ?? 0}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="bg-yellow-500"
        />
        <StatCard
          titleKey="totalDue"
          value={loadingSummary ? '...' : summaryError ? '!' : `$${(summary?.totalDue ?? 0).toFixed(2)}`}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
          color="bg-red-500"
        />
        <StatCard
          titleKey="grade"
          value={currentUser?.grade || t('na')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>}
          color="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickLink to="/payments" labelKey="makePayment" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>} />
        <QuickLink to="/history" labelKey="viewHistory" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 006 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} />
        <QuickLink to="/help" labelKey="getHelp" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>} />
        <Button variant="outline" className="block p-4 bg-white hover:bg-gray-50 rounded-lg shadow text-center transition-colors w-full h-full flex flex-col items-center justify-center" onClick={() => setIsCalendarOpen(true)}>
          <div className="mb-2 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
          </div>
          <span className="text-sm font-medium text-gray-700">Calendario Escolar</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('upcomingPayments')}>
          {loadingSummary ? (
            <p className="text-gray-600">Cargando...</p>
          ) : summaryError ? (
            <p className="text-red-600">{summaryError}</p>
          ) : summary && summary.upcomingPayments && summary.upcomingPayments.length > 0 ? (
            <ul className="space-y-3">
              {summary.upcomingPayments.map(p => (
                <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{p.concept}</p>
                    <p className="text-sm text-gray-500">{t('dueDate')}: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : ''}</p>
                  </div>
                  <span className="font-semibold text-gray-700">${p.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">{t('noUpcomingPayments')}</p>
          )}
          <div className="mt-4">
            <Link to="/payments">
              <Button variant="outline" className="w-full">{t('viewAllPendingPayments')}</Button>
            </Link>
          </div>
        </Card>

        <Card title={t('recentActivity')}>
            {recentPaidPayments.length > 0 ? (
                 <ul className="space-y-3">
                 {recentPaidPayments.map(p => (
                   <li key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                     <div>
                       <p className="font-medium text-gray-800">{p.concept}</p>
                       <p className="text-sm text-green-600">{t('paid')}: {new Date(p.paidDate!).toLocaleDateString()}</p>
                     </div>
                     <span className="font-semibold text-gray-700">${p.amount.toFixed(2)}</span>
                   </li>
                 ))}
               </ul>
            ) : (
                <p className="text-gray-600">{t('noRecentPaymentActivity')}</p>
            )}
            <div className="mt-4">
                <Link to="/history">
                    <Button variant="outline" className="w-full">{t('viewFullPaymentHistory')}</Button>
                </Link>
            </div>
        </Card>
      </div>

      <SchoolCalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} payments={pendingPayments} />
    </div>
  );
};

export default DashboardPage;
