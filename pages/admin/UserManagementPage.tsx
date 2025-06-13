import React, { useState, useEffect, FormEvent } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { User, Role } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
);

const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

// Extiende el tipo User para la vista de administración (solo para UI, no para lógica de negocio)
type AdminUserCard = import('../../types').User & {
  phone?: string;
  address?: string;
  section?: string;
  status?: string;
  lastPaymentDate?: string;
  pendingAmount?: number;
};

interface UserFormState {
  id?: string; 
  name: string;
  email: string;
  password?: string;
  role: Role;
  grade?: string;
  phone?: string;
  address?: string;
}

const API_URL = 'http://localhost:8080/api/users';

const UserManagementPage: React.FC = () => {
  // Estado para usuarios y carga
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormState | null>(null);
  const [formState, setFormState] = useState<UserFormState>({ name: '', email: '', password: '', role: Role.Student, grade: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);

  // Obtener usuarios al cargar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // CRUD API
  const addUser = async (user: Partial<UserFormState>) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error('Error al crear usuario');
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateUser = async (id: string, user: Partial<UserFormState>) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error('Error al actualizar usuario');
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormState({ name: '', email: '', password: '', role: Role.Student, grade: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user); 
    setFormState({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      grade: user.grade ?? '',
      phone: (user as any).phone ?? '',
      address: (user as any).address ?? ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (editingUser) { 
      const { id, name, email, role, grade, phone, address } = formState;
      if (!id) { 
        setFormError(t("errorUserIdMissing"));
        setIsSubmitting(false);
        return;
      }
      const result = await updateUser(id, { name, email, role, grade: role === Role.Student ? grade : undefined, phone, address });
      if (result.success) {
        handleCloseModal();
      } else {
        setFormError(result.message ?? t('failedToUpdateUser'));
      }
    } else { 
      const { name, email, password, role, grade, phone, address } = formState;
      if (!password) {
        setFormError(t('passwordRequiredForNew'));
        setIsSubmitting(false);
        return;
      }
      const result = await addUser({ name, email, password, role, grade: role === Role.Student ? grade : undefined, phone, address });
      if (result.success) {
        handleCloseModal();
      } else {
        setFormError(result.message ?? t('failedToAddUser'));
      }
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async () => {
    if (!showDeleteConfirm) return;
    setIsSubmitting(true);
    const result = await deleteUser(showDeleteConfirm.id);
    if (!result.success && result.message) {
      alert(result.message); 
    }
    setIsSubmitting(false);
    setShowDeleteConfirm(null);
  };

  // En el renderizado, usa 'users' en vez de 'allUsers' o 'usersForCards', y elimina simulaciones
  const usersForCards: AdminUserCard[] = users.map(u => ({
    ...u,
    phone: u.phone,
    address: u.address,
    section: u.grade ? `Sección ${u.grade}` : undefined,
    status: 'Activo',
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{t('userManagement')}</h1>
        <Button variant="primary" onClick={openAddModal} leftIcon={<UserPlusIcon className="w-5 h-5" />}>
          {t('addNewUser')}
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <input
            type="text"
            placeholder={t('searchUsersPlaceholder')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Tarjetas de usuarios estilo 3 columnas, colores acorde al aplicativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {usersForCards.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">{t('noUsersFound')}</div>
          )}
          {usersForCards.map(user => (
            <div key={user.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 flex flex-col gap-3 relative transition hover:shadow-xl">
              {/* Header con nombre, estado y rol */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-200 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow">
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-7 h-7' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' d='M12 14.25c2.485 0 4.5-2.015 4.5-4.5S14.485 5.25 12 5.25 7.5 7.265 7.5 9.75s2.015 4.5 4.5 4.5zm0 0c-3.375 0-6.75 1.687-6.75 3.75v.375a.75.75 0 00.75.75h12a.75.75 0 00.75-.75v-.375c0-2.063-3.375-3.75-6.75-3.75z' /></svg>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800 leading-tight">{user.name}</div>
                    <div className="text-xs text-blue-600 font-semibold">ID: {user.id}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{user.status}</span>
              </div>
              {/* Info adicional para estudiantes */}
              {user.role === Role.Student && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{user.grade ?? t('na')}</span>
                </div>
              )}
              {/* Info de contacto y dirección */}
              <div className="flex flex-col gap-1 text-sm text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h.75a2.25 2.25 0 002.25-2.25v-2.25a2.25 2.25 0 00-2.25-2.25h-1.125a1.125 1.125 0 01-1.125-1.125V15a2.25 2.25 0 00-2.25-2.25h-1.125A1.125 1.125 0 019.75 11.625V10.5A2.25 2.25 0 007.5 8.25H5.25A2.25 2.25 0 003 10.5v.75z" /></svg>
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75m19.5 0v.243a2.25 2.25 0 01-.659 1.591l-7.5 7.5a2.25 2.25 0 01-3.182 0l-7.5-7.5A2.25 2.25 0 012.25 6.993V6.75" /></svg>
                  <span>{user.email}</span>
                </div>
                {user.address && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-4.556 0-8.25 3.694-8.25 8.25 0 5.25 8.25 11.25 8.25 11.25s8.25-6 8.25-11.25c0-4.556-3.694-8.25-8.25-8.25z" /></svg>
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
              {/* Línea divisoria */}
              <div className="border-t border-blue-200 my-2"></div>
              {/* Botones de acción */}
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="md" className="flex-1 flex items-center justify-center gap-2 border-blue-400 text-blue-600 hover:bg-blue-50" onClick={() => {/* Aquí puedes abrir modal o navegar a detalle */}}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12s-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
                  Ver
                </Button>
                <Button variant="outline" size="md" className="flex-1 flex items-center justify-center gap-2 border-blue-400 text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(user)}>
                  <PencilSquareIcon className="w-5 h-5" />
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? t('editUserModalTitle') : t('addUserModalTitle')}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>{t('cancel')}</Button>
              <Button type="submit" form="user-form" variant="primary" disabled={isSubmitting}>
                {getSubmitButtonText(isSubmitting, editingUser, t)}
              </Button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            {formError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{formError}</p>}
            <div>
              <label htmlFor="form_name" className="block text-sm font-medium text-gray-700">{t('fullName')}</label>
              <input type="text" name="name" id="form_name" value={formState.name} onChange={handleChange} required 
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="form_email" className="block text-sm font-medium text-gray-700">{t('emailAddress')}</label>
              <input type="email" name="email" id="form_email" value={formState.email} onChange={handleChange} required
                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            {!editingUser && ( 
              <div>
                <label htmlFor="form_password" className="block text-sm font-medium text-gray-700">{t('password')}</label>
                <input type="password" name="password" id="form_password" value={formState.password} onChange={handleChange} required={!editingUser} 
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            )}
             {editingUser && (
              <p className="text-xs text-gray-500">{t('passwordCannotBeChanged')}</p>
            )}
            {formState.role === Role.Student && (
                 <>
                    <div>
                      <label htmlFor="form_grade" className="block text-sm font-medium text-gray-700">{t('gradeOptionalForStudents')}</label>
                      <input type="text" name="grade" id="form_grade" value={formState.grade ?? ''} onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="form_phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <input type="text" name="phone" id="form_phone" value={formState.phone ?? ''} onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label htmlFor="form_address" className="block text-sm font-medium text-gray-700">Dirección</label>
                      <input type="text" name="address" id="form_address" value={formState.address ?? ''} onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                 </>
            )}
            <div>
              <label htmlFor="form_role" className="block text-sm font-medium text-gray-700">{t('role')}</label>
              <select name="role" id="form_role" value={formState.role} onChange={handleChange} required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value={Role.Student}>{t('student')}</option>
                <option value={Role.Admin}>{t('admin')}</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title={t('confirmDeleteTitle')}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} disabled={isSubmitting}>{t('cancel')}</Button>
              <Button variant="danger" onClick={handleDeleteUser} disabled={isSubmitting}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : t('confirmDelete')}
              </Button>
            </>
          }
        >
          <div className="text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m0 0v3m0-3h3m-3 0H9m3-9a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800">{t('confirmDeleteTitle')}</h2>
            <p className="text-gray-600 mt-2">{t('confirmDeleteMessage')}</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper para el texto del botón submit
const getSubmitButtonText = (isSubmitting: boolean, editingUser: UserFormState | null, t: any) => {
  if (isSubmitting) return <LoadingSpinner size="sm" />;
  if (editingUser) return t('saveChanges');
  return t('addNewUser');
};

export default UserManagementPage;
