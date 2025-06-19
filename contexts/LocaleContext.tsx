
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Language } from '../types';

// Direct embedding of translation strings
const enTranslations: Record<string, string> = {
  "schoolPayments": "School Payments",
  "welcome": "Welcome",
  "logout": "Logout",
  "login": "Login",
  "register": "Register",
  "dashboard": "Dashboard",
  "pendingPayments": "Pending Payments",
  "paymentHistory": "Payment History",
  "helpCenter": "Help Center",
  "adminDashboard": "Admin Dashboard",
  "allPayments": "All Payments",
  "userManagement": "User Management",
  "selectLanguage": "Select Language",
  "english": "English",
  "spanish": "Español",
  "paymentPortal": "Payment Portal",
  "supportContact": "For support, contact reinobritanico@school.edu or call (01) 456-7890.",
  "signInToAccount": "Sign in to your account",
  "createNewAccountLink": "create a new account",
  "or": "Or",
  "emailAddress": "Email address",
  "password": "Password",
  "signIn": "Sign in",
  "createYourAccount": "Create your account",
  "alreadyHaveAccountLink": "Sign in",
  "fullName": "Full Name",
  "confirmPassword": "Confirm Password",
  "createAccount": "Create Account",
  "passwordsDoNotMatch": "Passwords do not match.",
  "emailExistsOrRegistrationFailed": "Email already exists or registration failed. Please try again.",
  "unexpectedError": "An unexpected error occurred. Please try again later.",
  "invalidEmailOrPassword": "Invalid email or password. Please try again.",
  "student": "Student",
  "admin": "Admin",
  "grade": "Grade",
  "role": "Role",
  "addNewUser": "Add New User",
  "editUser": "Edit User",
  "saveChanges": "Save Changes",
  "deleteUser": "Delete User",
  "cancel": "Cancel",
  "name": "Name",
  "email": "Email",
  "actions": "Actions",
  "searchUsersPlaceholder": "Search users by name or email...",
  "noUsersFound": "No users found.",
  "addUserModalTitle": "Add New User",
  "editUserModalTitle": "Edit User",
  "passwordRequiredForNew": "Password is required for new users.",
  "passwordCannotBeChanged": "Password cannot be changed from this form for existing users.",
  "gradeOptionalForStudents": "Grade (Optional for Students)",
  "confirmDeletion": "Confirm Deletion",
  "confirmDeleteUserMessage": "Are you sure you want to delete the user {name} ({email})? This action cannot be undone.",
  "failedToUpdateUser": "Failed to update user.",
  "failedToAddUser": "Failed to add user.",
  "errorUserIdMissing": "Error: User ID missing for update.",
  "allPaymentsTitle": "All Payments",
  "filterByStudent": "Filter by Student:",
  "allStudents": "All Students",
  "systemWidePaymentRecords": "System-Wide Payment Records",
  "studentName": "Student Name",
  "gradeClass": "Grade/Class",
  "concept": "Concept",
  "invoiceNo": "Invoice #",
  "amount": "Amount",
  "dueDate": "Due Date",
  "paidDate": "Paid Date",
  "status": "Status",
  "modifyStatus": "Modify Status",
  "noPaymentsFound": "No Payments Found",
  "noPaymentsForStudent": "No payments found for the selected student.",
  "noPaymentsInSystem": "There are no payment records in the system yet.",
  "paid": "Paid",
  "pending": "Pending",
  "overdue": "Overdue",
  "processing": "Processing",
  "na": "N/A",
  "makePayment": "Make a Payment",
  "viewHistory": "View History",
  "getHelp": "Get Help",
  "schoolCalendar": "School Calendar",
  "upcomingPayments": "Upcoming Payments",
  "recentActivity": "Recent Activity",
  "viewAllPendingPayments": "View All Pending Payments",
  "viewFullPaymentHistory": "View Full Payment History",
  "noUpcomingPayments": "No upcoming payments. You're all caught up!",
  "noRecentPaymentActivity": "No recent payment activity.",
  "pendingPaymentsTitle": "Pending Payments",
  "totalDue": "Total Due:",
  "outstandingBalances": "Outstanding Balances",
  "action": "Action",
  "allPaymentsUpToDate": "All payments are up to date!",
  "noPendingOrOverdue": "You have no pending or overdue payments at this time.",
  "confirmPayment": "Confirm Payment",
  "confirmPayMessage": "Are you sure you want to pay ${amount} for \"{concept}\"?",
  "confirmAndPay": "Confirm & Pay",
  "processingPayment": "Processing payment...",
  "pleaseWaitPayment": "Please wait, your payment is being processed.",
  "completedTransactions": "Completed Transactions",
  "noPaymentHistoryFound": "No Payment History Found",
  "noPaymentsMade": "You have not made any payments through the portal yet.",
  "paymentReceipt": "Payment Receipt",
  "paymentSuccessful": "Payment Successful!",
  "thankYouPayment": "Thank you for your payment.",
  "transactionId": "Transaction ID:",
  "paymentFor": "Payment For:",
  "amountPaid": "Amount Paid:",
  "datePaid": "Date Paid:",
  "downloadPdf": "Download PDF",
  "close": "Close",
  "askAiAssistant": "Ask our AI Assistant",
  "typeYourQuestion": "Type your question here...",
  "aiAssistantUnavailable": "AI assistant unavailable",
  "thinking": "Thinking...",
  "commonQuestions": "Common Questions",
  "contactSupport": "Contact Support",
  "contactSupportMessage": "If you can't find an answer, please contact our support team:",
  "emailLabel": "Email:",
  "phoneLabel": "Phone:",
  "officeHoursLabel": "Office Hours:",
  "officeHoursTime": "Mon-Fri, 9 AM - 5 PM",
  "adminDashboardWelcome": "Welcome, {name}!",
  "totalPaymentsRecorded": "Total Payments Recorded",
  "totalAmountCollected": "Total Amount Collected",
  "registeredUsers": "Registered Users",
  "recentPaymentsOverview": "Recent Payments Overview",
  "viewAllPayments": "View All Payments",
  "noPaymentsRecordedYet": "No payments recorded yet.",
  "userManagementOverview": "User Management Overview",
  "userManagementSummary": "Currently managing {count} user accounts.",
  "userManagementInfo": "Includes students and administrators. For detailed user management, including adding new users or modifying existing ones, please visit the User Management page.",
  "goToUserManagement": "Go to User Management"
};

const esTranslations: Record<string, string> = {
  "schoolPayments": "Pagos Escolares",
  "welcome": "Bienvenido(a)",
  "logout": "Cerrar Sesión",
  "login": "Iniciar Sesión",
  "register": "Registrarse",
  "dashboard": "Tablero",
  "pendingPayments": "Pagos Pendientes",
  "paymentHistory": "Historial de Pagos",
  "helpCenter": "Centro de Ayuda",
  "adminDashboard": "Tablero Admin",
  "allPayments": "Todos los Pagos",
  "userManagement": "Gestión de Usuarios",
  "selectLanguage": "Seleccionar Idioma",
  "english": "Inglés",
  "spanish": "Español",
  "paymentPortal": "Portal de Pagos",
  "supportContact": "Para soporte, contacte a reinobitanico@school.edu o llame al (01) 456-7890.",
  "signInToAccount": "Inicia sesión en tu cuenta",
  "createNewAccountLink": "crear una nueva cuenta",
  "or": "O",
  "emailAddress": "Dirección de correo electrónico",
  "password": "Contraseña",
  "signIn": "Iniciar Sesión",
  "createYourAccount": "Crea tu cuenta",
  "alreadyHaveAccountLink": "Iniciar Sesión",
  "fullName": "Nombre Completo",
  "confirmPassword": "Confirmar Contraseña",
  "createAccount": "Crear Cuenta",
  "passwordsDoNotMatch": "Las contraseñas no coinciden.",
  "emailExistsOrRegistrationFailed": "El correo electrónico ya existe o el registro falló. Por favor, inténtalo de nuevo.",
  "unexpectedError": "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
  "invalidEmailOrPassword": "Correo electrónico o contraseña no válidos. Por favor, inténtalo de nuevo.",
  "student": "Estudiante",
  "admin": "Administrador",
  "grade": "Grado",
  "role": "Rol",
  "addNewUser": "Agregar Nuevo Usuario",
  "editUser": "Editar Usuario",
  "saveChanges": "Guardar Cambios",
  "deleteUser": "Eliminar Usuario",
  "cancel": "Cancelar",
  "name": "Nombre",
  "email": "Correo Electrónico",
  "actions": "Acciones",
  "searchUsersPlaceholder": "Buscar usuarios por nombre o correo...",
  "noUsersFound": "No se encontraron usuarios.",
  "addUserModalTitle": "Agregar Nuevo Usuario",
  "editUserModalTitle": "Editar Usuario",
  "passwordRequiredForNew": "La contraseña es obligatoria para nuevos usuarios.",
  "passwordCannotBeChanged": "La contraseña no se puede cambiar desde este formulario para usuarios existentes.",
  "gradeOptionalForStudents": "Grado (Opcional para Estudiantes)",
  "confirmDeletion": "Confirmar Eliminación",
  "confirmDeleteUserMessage": "¿Estás seguro de que quieres eliminar al usuario {name} ({email})? Esta acción no se puede deshacer.",
  "failedToUpdateUser": "Error al actualizar el usuario.",
  "failedToAddUser": "Error al agregar el usuario.",
  "errorUserIdMissing": "Error: Falta el ID de usuario para la actualización.",
  "allPaymentsTitle": "Todos los Pagos",
  "filterByStudent": "Filtrar por Estudiante:",
  "allStudents": "Todos los Estudiantes",
  "systemWidePaymentRecords": "Registros de Pago de Todo el Sistema",
  "studentName": "Nombre del Estudiante",
  "gradeClass": "Grado/Clase",
  "concept": "Concepto",
  "invoiceNo": "Nº Factura",
  "amount": "Monto",
  "dueDate": "Fecha de Vencimiento",
  "paidDate": "Fecha de Pago",
  "status": "Estado",
  "modifyStatus": "Modificar Estado",
  "noPaymentsFound": "No se Encontraron Pagos",
  "noPaymentsForStudent": "No se encontraron pagos para el estudiante seleccionado.",
  "noPaymentsInSystem": "Aún no hay registros de pago en el sistema.",
  "paid": "Pagado",
  "pending": "Pendiente",
  "overdue": "Vencido",
  "processing": "Procesando",
  "na": "N/A",
  "makePayment": "Realizar un Pago",
  "viewHistory": "Ver Historial",
  "getHelp": "Obtener Ayuda",
  "schoolCalendar": "Calendario Escolar",
  "upcomingPayments": "Pagos Próximos",
  "recentActivity": "Actividad Reciente",
  "viewAllPendingPayments": "Ver Todos los Pagos Pendientes",
  "viewFullPaymentHistory": "Ver Historial de Pagos Completo",
  "noUpcomingPayments": "No hay pagos próximos. ¡Estás al día!",
  "noRecentPaymentActivity": "No hay actividad de pago reciente.",
  "pendingPaymentsTitle": "Pagos Pendientes",
  "totalDue": "Total Adeudado:",
  "outstandingBalances": "Saldos Pendientes",
  "action": "Acción",
  "allPaymentsUpToDate": "¡Todos los pagos están al día!",
  "noPendingOrOverdue": "No tienes pagos pendientes o vencidos en este momento.",
  "confirmPayment": "Confirmar Pago",
  "confirmPayMessage": "¿Estás seguro de que quieres pagar ${amount} por \"{concept}\"?",
  "confirmAndPay": "Confirmar y Pagar",
  "processingPayment": "Procesando pago...",
  "pleaseWaitPayment": "Por favor espera, tu pago está siendo procesado.",
  "completedTransactions": "Transacciones Completadas",
  "noPaymentHistoryFound": "No se Encontró Historial de Pagos",
  "noPaymentsMade": "Aún no has realizado ningún pago a través del portal.",
  "paymentReceipt": "Recibo de Pago",
  "paymentSuccessful": "¡Pago Exitoso!",
  "thankYouPayment": "Gracias por tu pago.",
  "transactionId": "ID de Transacción:",
  "paymentFor": "Pago Por:",
  "amountPaid": "Monto Pagado:",
  "datePaid": "Fecha de Pago:",
  "downloadPdf": "Descargar PDF",
  "close": "Cerrar",
  "askAiAssistant": "Pregunta a nuestro Asistente IA",
  "typeYourQuestion": "Escribe tu pregunta aquí...",
  "aiAssistantUnavailable": "Asistente IA no disponible",
  "thinking": "Pensando...",
  "commonQuestions": "Preguntas Comunes",
  "contactSupport": "Contactar Soporte",
  "contactSupportMessage": "Si no encuentras una respuesta, por favor contacta a nuestro equipo de soporte:",
  "emailLabel": "Correo:",
  "phoneLabel": "Teléfono:",
  "officeHoursLabel": "Horario de Oficina:",
  "officeHoursTime": "Lun-Vie, 9 AM - 5 PM",
  "adminDashboardWelcome": "¡Bienvenido(a), {name}!",
  "totalPaymentsRecorded": "Total de Pagos Registrados",
  "totalAmountCollected": "Monto Total Recaudado",
  "registeredUsers": "Usuarios Registrados",
  "recentPaymentsOverview": "Resumen de Pagos Recientes",
  "viewAllPayments": "Ver Todos los Pagos",
  "noPaymentsRecordedYet": "Aún no se han registrado pagos.",
  "userManagementOverview": "Resumen de Gestión de Usuarios",
  "userManagementSummary": "Actualmente gestionando {count} cuentas de usuario.",
  "userManagementInfo": "Incluye estudiantes y administradores. Para una gestión detallada de usuarios, incluyendo agregar nuevos usuarios o modificar existentes, por favor visita la página de Gestión de Usuarios.",
  "goToUserManagement": "Ir a Gestión de Usuarios"
};

type TranslationsMap = Record<Language, Record<string, string>>;

const translationsData: TranslationsMap = {
  [Language.EN]: enTranslations,
  [Language.ES]: esTranslations,
};

interface LocaleContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLang = localStorage.getItem('appLanguage');
    return (storedLang as Language) || Language.EN; // Default to English
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    document.documentElement.lang = language; // Set lang attribute on HTML element
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    let translation = translationsData[language]?.[key] || translationsData[Language.EN]?.[key] || key;
    
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
      });
    }
    return translation;
  }, [language]);

  return (
    <LocaleContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
