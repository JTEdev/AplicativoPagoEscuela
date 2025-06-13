
import React from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PaymentsPage from './pages/PaymentsPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import HelpPage from './pages/HelpPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminAllPaymentsPage from './pages/admin/AdminAllPaymentsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import { PaymentProvider } from './contexts/PaymentContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocaleProvider, useLocale } from './contexts/LocaleContext'; // Import LocaleProvider and useLocale
import { useTranslation } from './hooks/useTranslation'; // Import useTranslation
import ProtectedRoute from './components/ProtectedRoute';
import { Role, Language } from './types'; // Import Language
import Button from './components/ui/Button'; 

// Icons (remain unchanged)
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const PaymentsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>;
const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const HelpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;
const AdminDashboardIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
const UserManagementIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 16.5v1.875a3.375 3.375 0 01-3.375 3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 0113.5 16.5h6z" /></svg>;
const AllPaymentsIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 19.875v-6.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125V3.75A1.125 1.125 0 014.125 2.625h15.75A1.125 1.125 0 0121 3.75v9.375m-13.5-3.063V6.375m4.5 3.688V6.375m4.5 3.688V6.375" /></svg>;
const LanguageIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>;


const defaultIconProps = { className: "w-6 h-6" };


const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation(); // Use translation hook

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-600 mr-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">{t('schoolPayments')}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">{t('selectLanguage')}</label>
             <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <LanguageIcon className="h-5 w-5 text-gray-500" />
            </div>
            <select 
                id="language-select"
                value={language} 
                onChange={handleLanguageChange}
                className="appearance-none block w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-8 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm shadow-sm hover:border-gray-400"
            >
                <option value={Language.EN}>{t('english')}</option>
                <option value={Language.ES}>{t('spanish')}</option>
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span>{t('welcome')}, {currentUser.name} ({t(currentUser.role)})</span>
                <Button onClick={handleLogout} variant="outline" size="sm">{t('logout')}</Button>
              </div>
            ) : (
              <div className="space-x-2">
                  <NavLink to="/login">
                      <Button variant="primary" size="sm">{t('login')}</Button>
                  </NavLink>
                  <NavLink to="/register">
                      <Button variant="secondary" size="sm">{t('register')}</Button>
                  </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const SidebarNav: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  if (!currentUser) return null; 

  const studentNavItems = [
    { path: '/', labelKey: 'dashboard', icon: (props:any) => DashboardIcon({...defaultIconProps, ...props}) },
    { path: '/payments', labelKey: 'pendingPayments', icon: (props:any) => PaymentsIcon({...defaultIconProps, ...props}) },
    { path: '/history', labelKey: 'paymentHistory', icon: (props:any) => HistoryIcon({...defaultIconProps, ...props}) },
    { path: '/help', labelKey: 'helpCenter', icon: (props:any) => HelpIcon({...defaultIconProps, ...props}) },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', labelKey: 'adminDashboard', icon: (props:any) => AdminDashboardIcon({...defaultIconProps, ...props}) },
    { path: '/admin/all-payments', labelKey: 'allPayments', icon: (props:any) => AllPaymentsIcon({...defaultIconProps, ...props}) },
    { path: '/admin/user-management', labelKey: 'userManagement', icon: (props:any) => UserManagementIcon({...defaultIconProps, ...props}) },
    { path: '/help', labelKey: 'helpCenter', icon: (props:any) => HelpIcon({...defaultIconProps, ...props}) },
  ];

  const navItems = currentUser.role === Role.Admin ? adminNavItems : studentNavItems;

  return (
    <nav className="mt-8 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/' || item.path === '/admin/dashboard'}
        >
          {({ isActive }) => {
            return (
              <span
                className={
                  `flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out group ${
                    isActive 
                      ? 'bg-blue-600 text-white'
                      : 'bg-transparent text-gray-700 hover:bg-blue-500 hover:text-white'
                  }`
                }
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon({
                  className: `w-5 h-5 mr-3 ${
                    isActive 
                      ? 'text-white'
                      : 'text-gray-500 group-hover:text-white'
                  }`
                })}
                {t(item.labelKey)}
              </span>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white p-6 shadow-lg flex flex-col">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
            SPS
          </div>
          <span className="text-xl font-semibold text-gray-700">{t('paymentPortal')}</span>
        </div>
        <SidebarNav />
        <div className="mt-auto">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              {t('supportContact')}
            </p>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      
      {/* Routes within the main layout */}
      <Route element={<MainLayout />}>
        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={[Role.Student, Role.Admin]} />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[Role.Student]} />}>
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/history" element={<PaymentHistoryPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={[Role.Admin]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/all-payments" element={<AdminAllPaymentsPage />} />
          <Route path="/admin/user-management" element={<UserManagementPage />} />
        </Route>
        
        {/* Common Protected Routes */}
         <Route element={<ProtectedRoute allowedRoles={[Role.Student, Role.Admin]} />}>
          <Route path="/help" element={<HelpPage />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <PaymentProvider>
        <LocaleProvider> {/* Added LocaleProvider */}
          <HashRouter>
            <AppContent />
          </HashRouter>
        </LocaleProvider>
      </PaymentProvider>
    </AuthProvider>
  );
};

export default App;
