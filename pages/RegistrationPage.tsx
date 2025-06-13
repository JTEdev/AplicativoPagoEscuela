
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Role } from '../types';
import { useTranslation } from '../hooks/useTranslation';


const RegistrationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await register(name, email, password); // register now returns an object
      if (result.success) {
        navigate('/'); 
      } else {
        setError(result.message || t('emailExistsOrRegistrationFailed'));
      }
    } catch (err) {
      setError(t('unexpectedError'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
            <div className="flex justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.247-4.588a9.132 9.132 0 01-.247-4.588 3 3 0 00-4.682-2.72m4.682 2.72a3 3 0 01-4.682 2.72m0 0a3 3 0 01-4.682-2.72m0 0a9.094 9.094 0 00-3.741-.479m0 0a3 3 0 00-4.682 2.72m8.86 0a3 3 0 014.682 2.72m0 0V19.5A2.25 2.25 0 0112 21.75a2.25 2.25 0 01-2.25-2.25v-.522m0 0a3 3 0 00-4.682-2.72M12 12.75a3 3 0 000-6 3 3 0 000 6z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('createYourAccount')}
          </h2>
           <p className="mt-2 text-center text-sm text-gray-600">
            {t('alreadyHaveAccountLink')}{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('signIn')}
            </Link>
          </p>
        </div>
        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name_register" className="block text-sm font-medium text-gray-700"> {/* Unique ID */}
                {t('fullName')}
              </label>
              <input id="name_register" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                     className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email_register" className="block text-sm font-medium text-gray-700"> {/* Unique ID */}
                {t('emailAddress')}
              </label>
              <input id="email_register" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                     className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="password_registration" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input id="password_registration" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                     className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="confirm-password_registration" className="block text-sm font-medium text-gray-700"> {/* Unique ID */}
                {t('confirmPassword')}
              </label>
              <input id="confirm-password_registration" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                     className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" color="text-white" /> : t('createAccount')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationPage;
