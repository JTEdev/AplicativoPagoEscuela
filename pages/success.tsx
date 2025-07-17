
import React, { useEffect, useState } from 'react';
import { markPaymentAsPaid } from '../services/paymentService';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    setShowModal(true);
    // Obtener paymentId y transactionId de la URL
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('paymentId');
    const transactionId = params.get('transactionId');
    if (paymentId) {
      markPaymentAsPaid(paymentId, transactionId || undefined)
        .then(() => {
          // Redirigir al dashboard y forzar recarga para sincronizar actividad reciente
          setTimeout(() => {
            navigate('/', { replace: true });
            window.location.reload();
          }, 1200);
        })
        .catch(() => {
          // Opcional: mostrar mensaje de error
        });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Pago exitoso"
        footer={
          <Button variant="success" onClick={() => { window.location.href = '/payments'; }}>
            Ir a Pagos Pendientes
          </Button>
        }
      >
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">¡Pago realizado con éxito!</h2>
          <p className="text-gray-700 mb-4">Gracias por tu pago. Puedes cerrar esta ventana o volver al inicio.</p>
        </div>
      </Modal>
    </div>
  );
};

export default SuccessPage;
