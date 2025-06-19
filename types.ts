export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Processing = 'Processing'
}

export interface Payment {
  id: string;
  userId: string; // <-- Agregado para filtrar correctamente
  studentName: string;
  concept: string;
  amount: number;
  dueDate: string; // ISO Date string
  paidDate?: string; // ISO Date string
  status: PaymentStatus;
  invoiceNumber?: string;
  grade?: string; // <-- Agregado para mostrar grado/clase
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  parentId: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export enum Role {
  Student = 'student',
  Admin = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password should not be stored in client-side in real apps
  role: Role;
  grade?: string; // Optional: if student
  phone?: string;
  address?: string;
}

export enum Language {
  EN = 'en',
  ES = 'es',
}
