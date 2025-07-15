import React, { useState } from 'react';
import Modal from './Modal';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Payment } from '../../types';
import { CalendarTileProperties } from 'react-calendar';

interface SchoolCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: Payment[];
}

const SchoolCalendarModal: React.FC<SchoolCalendarModalProps> = ({ isOpen, onClose, payments }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fechas de vencimiento de pagos pendientes
  const dueDates = payments.map(p => new Date(p.dueDate));

  // Pagos por fecha
  const paymentsByDate = payments.reduce((acc, p) => {
    const dateStr = new Date(p.dueDate).toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(p);
    return acc;
  }, {} as Record<string, Payment[]>);

  const getTileContent = ({ date }: CalendarTileProperties) => {
    const isDue = dueDates.some(d => d.toDateString() === date.toDateString());
    if (isDue) {
      return (
        <span className="inline-block ml-1 text-yellow-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
        </span>
      );
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calendario Escolar" size="lg" footer={<button className="btn btn-secondary" onClick={onClose}>Cerrar</button>}>
      <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-stretch" style={{maxWidth: '100%'}}>
        <div className="min-w-[260px] max-w-[320px] mx-auto">
          <Calendar
            value={selectedDate}
            onClickDay={date => setSelectedDate(date)}
            tileClassName={({ date }) => {
              const isDue = dueDates.some(d => d.toDateString() === date.toDateString());
              return isDue ? 'bg-yellow-300 font-bold text-yellow-900 rounded-full border-2 border-yellow-500' : undefined;
            }}
            tileContent={getTileContent}
          />
          <div className="mb-4 flex gap-4 items-center mt-2">
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-300 rounded-full border-2 border-yellow-500 inline-block"></span> <span className="text-sm text-gray-700">Pago pendiente</span></span>
          </div>
        </div>
        <div className="flex-1 max-w-[320px] w-full overflow-y-auto" style={{maxHeight: '340px'}}>
          {selectedDate ? (
            <div>
              <h3 className="font-semibold text-lg mb-2">Pagos con vencimiento el {selectedDate.toLocaleDateString()}:</h3>
              {(paymentsByDate[selectedDate.toDateString()] || []).length > 0 ? (
                <ul className="space-y-2">
                  {paymentsByDate[selectedDate.toDateString()].map(p => (
                    <li key={p.id} className="p-4 bg-yellow-50 rounded shadow flex flex-col gap-1 border-l-4 border-yellow-400 max-w-full">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                        <span className="font-bold text-gray-800">{p.concept}</span>
                      </div>
                      <div className="text-sm text-gray-600">Monto: <span className="font-semibold text-yellow-700">${p.amount.toFixed(2)}</span></div>
                      <div className="text-sm text-gray-600">Estado: <span className="font-semibold">{p.status}</span></div>
                      <div className="text-xs text-gray-400">Vence: {new Date(p.dueDate).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay pagos pendientes para esta fecha.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Selecciona una fecha para ver los pagos pendientes.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SchoolCalendarModal;
