import { Payment, PaymentStatus, Student } from './types';

export const MOCK_STUDENT: Student = {
  id: 'student-001',
  name: 'John Doe',
  grade: 'Grade 10A',
  parentId: 'parent-001',
};

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'payment-001',
    studentName: MOCK_STUDENT.name,
    concept: 'Monthly Tuition - September 2024',
    amount: 750.00,
    dueDate: '2024-09-05',
    status: PaymentStatus.Pending,
    invoiceNumber: 'INV-2024-09-001',
    userId: MOCK_STUDENT.id,
  },
  {
    id: 'payment-002',
    studentName: MOCK_STUDENT.name,
    concept: 'Technology Fee - 2024-2025',
    amount: 150.00,
    dueDate: '2024-08-20',
    status: PaymentStatus.Overdue,
    invoiceNumber: 'INV-2024-08-123',
    userId: MOCK_STUDENT.id,
  },
  {
    id: 'payment-003',
    studentName: MOCK_STUDENT.name,
    concept: 'Enrollment Fee - 2024-2025',
    amount: 500.00,
    dueDate: '2024-07-15',
    paidDate: '2024-07-10',
    status: PaymentStatus.Paid,
    invoiceNumber: 'INV-2024-07-088',
    userId: MOCK_STUDENT.id,
  },
  {
    id: 'payment-004',
    studentName: MOCK_STUDENT.name,
    concept: 'Monthly Tuition - August 2024',
    amount: 750.00,
    dueDate: '2024-08-05',
    paidDate: '2024-08-01',
    status: PaymentStatus.Paid,
    invoiceNumber: 'INV-2024-08-001',
    userId: MOCK_STUDENT.id,
  },
  {
    id: 'payment-005',
    studentName: MOCK_STUDENT.name,
    concept: 'Extracurricular Activities - Soccer',
    amount: 120.00,
    dueDate: '2024-09-15',
    status: PaymentStatus.Pending,
    invoiceNumber: 'INV-2024-09-205',
    userId: MOCK_STUDENT.id,
  },
  {
    id: 'payment-006',
    studentName: MOCK_STUDENT.name,
    concept: 'School Trip Deposit - Washington D.C.',
    amount: 250.00,
    dueDate: '2024-10-01',
    status: PaymentStatus.Pending,
    invoiceNumber: 'INV-2024-10-030',
    userId: MOCK_STUDENT.id,
  }
];

export const API_KEY_WARNING = "Gemini API Key not found. Please set the `process.env.API_KEY` environment variable for the Help Center to function.";
export const GEMINI_MODEL_TEXT = 'gemini-2.0-flash';
export const GEMINI_SYSTEM_INSTRUCTION = "You are a friendly and helpful assistant for a private school's payment portal. Answer questions related to tuition, fees, payment procedures, deadlines, and school financial policies. Be concise, clear, and polite. If you don't know the answer, say so rather than making one up. Format important details like dates or amounts clearly. Avoid giving financial advice beyond explaining school policies.";

