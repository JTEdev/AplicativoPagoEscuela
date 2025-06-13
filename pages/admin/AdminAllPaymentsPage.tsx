import React, { useState, useEffect, useMemo } from 'react';
import * as paymentService from '../../services/paymentService';
import * as userService from '../../services/userService';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Payment, PaymentStatus, Role, User } from '../../types';
import Button from '../../components/ui/Button'; 
import { useTranslation } from '../../hooks/useTranslation';

const AdminAllPaymentsPage: React.FC = () => {
  const { users } = useAuth();
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(''); 

  // Estado para modal de pago
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<Partial<Payment>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [statusSelections, setStatusSelections] = useState<{ [paymentId: string]: PaymentStatus }>({});

  // Estado para modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormState, setEditFormState] = useState<Partial<Payment>>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setStudents(allUsers.filter(u => u.role === Role.Student));
    } catch (err) {
      setStudents([]);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;
      // Traducir el status a mayúsculas para el backend
      let statusToSend = newStatus;
      if (newStatus === PaymentStatus.Paid) statusToSend = 'PAID' as any;
      else if (newStatus === PaymentStatus.Pending) statusToSend = 'PENDING' as any;
      else if (newStatus === PaymentStatus.Overdue) statusToSend = 'OVERDUE' as any;
      else if (newStatus === PaymentStatus.Processing) statusToSend = 'PROCESSING' as any;
      // Eliminar paidDate si es 'N/A' para que el backend asigne la fecha actual
      const paymentToSend = { ...payment, status: statusToSend };
      if (paymentToSend.paidDate === 'N/A') {
        delete paymentToSend.paidDate;
      }
      await paymentService.updatePayment(paymentId, paymentToSend);
      fetchPayments();
    } catch (err: any) {
      setError('Error al actualizar el estado del pago');
    }
  };

  const getStudentGrade = (studentName: string): string => {
    const studentUser = users.find(u => u.name === studentName && u.role === Role.Student);
    return studentUser?.grade || t('na');
  };

  const handleStatusChange = (paymentId: string, newStatus: PaymentStatus) => {
    if (Object.values(PaymentStatus).includes(newStatus) && newStatus !== PaymentStatus.Processing) {
      updatePaymentStatus(paymentId, newStatus);
    } else {
      console.warn("Invalid status update attempt or trying to set 'Processing' manually by admin.");
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === 'N/A') return t('na');
    // Parse yyyy-MM-dd como fecha local (sin desfase de zona horaria)
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };


  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments;
    if (selectedStudentId) {
      const selectedStudent = users.find(u => u.id === selectedStudentId);
      if (selectedStudent) {
        filtered = payments.filter(p => p.studentName === selectedStudent.name);
      }
    }

    return filtered.sort((a, b) => {
      if (a.studentName.toLowerCase() < b.studentName.toLowerCase()) return -1;
      if (a.studentName.toLowerCase() > b.studentName.toLowerCase()) return 1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });
  }, [payments, selectedStudentId, users]);
  
  const getStatusClass = (status: PaymentStatus) => {
    // Acepta tanto valores en inglés como en español
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

  // Crear pago
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      // Siempre toma la fecha del input tipo date (yyyy-MM-dd)
      const dueDateInput = (document.getElementById('form_dueDate') as HTMLInputElement)?.value;
      // Normaliza el status a string en español para el backend y siempre lo incluye
      let statusToSend: string = 'Pendiente';
      if (formState.status === PaymentStatus.Paid) statusToSend = 'Pagado';
      else if (formState.status === PaymentStatus.Overdue) statusToSend = 'Vencido';
      else if (formState.status === PaymentStatus.Processing) statusToSend = 'Procesando';
      const paymentToSend: any = { ...formState, dueDate: dueDateInput, status: statusToSend };
      console.log('paymentToSend', paymentToSend);
      await paymentService.createPayment(paymentToSend);
      setIsModalOpen(false);
      setFormState({});
      fetchPayments();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar pago
  const handleDeletePayment = async (id: string) => {
    if (!window.confirm(t('confirmDeletePayment'))) return;
    try {
      await paymentService.deletePayment(id);
      fetchPayments();
    } catch (err: any) {
      setError('Error al eliminar el pago');
    }
  };

  // Normaliza la fecha al abrir el modal
  const openAddModal = () => {
    setFormState({ dueDate: new Date().toISOString().substring(0, 10) });
    setIsModalOpen(true);
    setFormError(null);
  };

  // Actualiza el valor seleccionado en el select de estado
  const handleStatusSelectChange = (paymentId: string, newStatus: PaymentStatus) => {
    setStatusSelections(prev => ({ ...prev, [paymentId]: newStatus }));
  };

  const openEditModal = (payment: Payment) => {
    setEditFormState({ ...payment });
    setEditModalOpen(true);
    setEditFormError(null);
  };

const handleEditPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  setEditFormError(null);
  setEditSubmitting(true);
  try {
    const paymentId = editFormState.id;
    if (!paymentId) throw new Error('ID de pago no encontrado');
    const dueDateInput = (document.getElementById('edit_dueDate') as HTMLInputElement)?.value;

    // Mapeo robusto de estado
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'pendiente': 'Pendiente',
      'Pending': 'Pendiente',
      'Paid': 'Pagado',
      'paid': 'Pagado',
      'pagado': 'Pagado',
      'Pagado': 'Pagado',
      'overdue': 'Vencido',
      'Overdue': 'Vencido',
      'vencido': 'Vencido',
      'Vencido': 'Vencido',
      'processing': 'Procesando',
      'Processing': 'Procesando',
      'procesando': 'Procesando',
      'Procesando': 'Procesando',
    };
    const statusValue = (editFormState.status || '').toString();
    const statusToSend = statusMap[statusValue] || 'Pendiente';

    const paymentToSend: any = { ...editFormState, dueDate: dueDateInput, status: statusToSend };
    if (paymentToSend.paidDate === 'N/A') delete paymentToSend.paidDate;
    await paymentService.updatePayment(paymentId, paymentToSend);
    setEditModalOpen(false);
    setEditFormState({});
    fetchPayments();
  } catch (err: any) {
    setEditFormError(err.message);
  } finally {
    setEditSubmitting(false);
  }
};


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{t('allPaymentsTitle')}</h1>
        <div className="flex gap-2 items-end">
          <div>
            <label htmlFor="studentFilter" className="block text-sm font-medium text-gray-700 mb-1">
              {t('filterByStudent')}
            </label>
            <select
              id="studentFilter"
              name="studentFilter"
              className="mt-1 block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">{t('allStudents')}</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={openAddModal}>
            {t('addPayment')}
          </Button>
        </div>
      </div>

      <Card title={t('systemWidePaymentRecords')} bodyClassName="overflow-x-auto">
        {filteredAndSortedPayments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('studentName')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('gradeClass')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('concept')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('invoiceNo')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dueDate')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('paidDate')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('modifyStatus')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedPayments.map(payment => (
                <tr key={payment.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.grade || t('na')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.concept}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.invoiceNumber || t('na')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">${payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(payment.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.status && payment.status.toString().toUpperCase() === 'PAID' ? formatDate(payment.paidDate) : t('na')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(payment.status)}`}>
                          {t(payment.status.toLowerCase() as any)} 
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2 items-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditModal(payment)}
                      >
                        {t('edit')}
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeletePayment(payment.id)}>{t('delete')}</Button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.123 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V9a.75.75 0 01-.75.75H5.625a.75.75 0 01-.75-.75V7.5m7.5 0V9A.75.75 0 0018.375 9H19.5a.75.75 0 00.75-.75V7.5M3 13.5h18M3 13.5v-1.5A2.25 2.25 0 015.25 9.75h13.5A2.25 2.25 0 0121 12v1.5" />
            </svg>
            <p className="text-xl font-semibold text-gray-700">{t('noPaymentsFound')}</p>
            <p className="text-gray-500">{selectedStudentId ? t('noPaymentsForStudent') : t('noPaymentsInSystem')}</p>
          </div>
        )}
      </Card>

      {/* Modal para crear pago */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{t('addPayment')}</h2>
            {formError && <div className="text-red-500 mb-2">{formError}</div>}
            <form onSubmit={handleCreatePayment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('studentName')}</label>
                <select
                  required
                  value={formState.studentName || ''}
                  onChange={e => setFormState(f => ({ ...f, studentName: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">{t('selectStudent')}</option>
                  {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('concept')}</label>
                <input type="text" required value={formState.concept || ''} onChange={e => setFormState(f => ({ ...f, concept: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
                <input type="number" required min="0" value={formState.amount || ''} onChange={e => setFormState(f => ({ ...f, amount: Number(e.target.value) }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('dueDate')}</label>
                <input
                  id="form_dueDate"
                  type="date"
                  required
                  value={formState.dueDate ?
                    (formState.dueDate.includes('/')
                      ? (() => { const [d, m, y] = formState.dueDate.split('/'); return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; })()
                      : formState.dueDate)
                    : ''}
                  onChange={e => setFormState(f => ({ ...f, dueDate: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('invoiceNo')}</label>
                <input type="text" value={formState.invoiceNumber || ''} onChange={e => setFormState(f => ({ ...f, invoiceNumber: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                <select required value={formState.status || PaymentStatus.Pending} onChange={e => setFormState(f => ({ ...f, status: e.target.value as PaymentStatus }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  <option value={PaymentStatus.Pending}>{t('pending')}</option>
                  <option value={PaymentStatus.Paid}>{t('paid')}</option>
                  <option value={PaymentStatus.Overdue}>{t('overdue')}</option>
                  <option value={PaymentStatus.Processing}>{t('processing')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">{t('cancel')}</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? t('saving') : t('save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar pago */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setEditModalOpen(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{t('editPayment')}</h2>
            {editFormError && <div className="text-red-500 mb-2">{editFormError}</div>}
            <form onSubmit={handleEditPayment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('studentName')}</label>
                <select
                  required
                  value={editFormState.studentName || ''}
                  onChange={e => setEditFormState(f => ({ ...f, studentName: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">{t('selectStudent')}</option>
                  {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('concept')}</label>
                <input type="text" required value={editFormState.concept || ''} onChange={e => setEditFormState(f => ({ ...f, concept: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
                <input type="number" required min="0" value={editFormState.amount || ''} onChange={e => setEditFormState(f => ({ ...f, amount: Number(e.target.value) }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('dueDate')}</label>
                <input
                  id="edit_dueDate"
                  type="date"
                  required
                  value={editFormState.dueDate ?
                    (editFormState.dueDate.includes('/')
                      ? (() => { const [d, m, y] = editFormState.dueDate!.split('/'); return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; })()
                      : editFormState.dueDate)
                    : ''}
                  onChange={e => setEditFormState(f => ({ ...f, dueDate: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('invoiceNo')}</label>
                <input type="text" value={editFormState.invoiceNumber || ''} onChange={e => setEditFormState(f => ({ ...f, invoiceNumber: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                <select required value={editFormState.status || PaymentStatus.Pending} onChange={e => setEditFormState(f => ({ ...f, status: e.target.value as PaymentStatus }))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  <option value={PaymentStatus.Pending}>{t('pending')}</option>
                  <option value={PaymentStatus.Paid}>{t('paid')}</option>
                  <option value={PaymentStatus.Overdue}>{t('overdue')}</option>
                  <option value={PaymentStatus.Processing}>{t('processing')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setEditModalOpen(false)} type="button">{t('cancel')}</Button>
                <Button variant="primary" type="submit" disabled={editSubmitting}>{editSubmitting ? t('saving') : t('save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllPaymentsPage;
