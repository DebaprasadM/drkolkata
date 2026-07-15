export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'RECEPTIONIST';
  phone?: string;
  avatar?: string;
  doctorId?: string;
  isClinicAdmin?: boolean;
  clinicId?: string;
  isActive?: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  timezone: string;
}

export interface Doctor {
  id: string;
  userId: string;
  user: User;
  specialization?: string;
  qualification?: string;
  registrationNo?: string;
  consultationFee: number;
  availableDays?: string;
  availableSlots?: string;
  isAvailable: boolean;
  isClinicAdmin?: boolean;
  bio?: string;
  signature?: string;
  clinicId: string;
  _count?: { visits: number; prescriptions: number };
}

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  bloodGroup?: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  occupation?: string;
  medicalNotes?: string;
  clinicId: string;
  createdAt: string;
  _count?: { visits: number; prescriptions: number; payments: number };
  visits?: Visit[];
}

export interface Visit {
  id: string;
  visitDate: string;
  tokenNumber: number;
  consultationType: string;
  status: string;
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  vitals?: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: { user: { firstName: string; lastName: string } };
  clinicId: string;
  payment?: Payment;
  prescription?: { id: string; prescriptionNo: string };
}

export interface Payment {
  id: string;
  receiptNumber: string;
  amount: number;
  discount: number;
  netAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  referenceNo?: string;
  visitId: string;
  patientId: string;
  patient?: Patient;
  visit?: Visit;
  createdAt: string;
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  diagnosis?: string;
  clinicalNotes?: string;
  investigations?: string;
  advice?: string;
  nextVisitDate?: string;
  pdfUrl?: string;
  qrCode?: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: { user: { firstName: string; lastName: string } };
  visitId: string;
  visit: Visit;
  medicines: PrescriptionMedicine[];
  clinicId: string;
  createdAt: string;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  route?: string;
}

export interface QueueEntry {
  id: string;
  tokenNumber: number;
  status: string;
  calledAt?: string;
  completedAt?: string;
  visitId: string;
  visit: Visit & { patient: Patient };
  doctorId: string;
  doctor?: { user: { firstName: string; lastName: string } };
}

export interface SuperAdminStats {
  stats: {
    totalClinics: number;
    activeClinics: number;
    totalPatients: number;
    totalDoctors: number;
    totalUsers: number;
    totalRevenue: number;
  };
}

export interface DashboardStats {
  stats: {
    todayPatients: number;
    todayRevenue: number;
    waitingPatients: number;
    inConsultation: number;
    completedConsultations: number;
    skippedToday: number;
    totalDoctors: number;
    availableDoctors: number;
    totalPatients: number;
    monthlyRevenue: number;
    yesterdayPatients: number;
    yesterdayRevenue: number;
    revTrend: number;
    patTrend: number;
  };
  patientFlow: {
    registered: number;
    waiting: number;
    inConsultation: number;
    completed: number;
    skipped: number;
  };
  charts: {
    dailyRevenue: Array<{ date: string; revenue: number; patients: number }>;
    doctorStats: Array<{ id: string; name: string; specialization?: string; todayPatients: number; isAvailable: boolean }>;
  };
  recentActivities: Array<{
    type: 'visit' | 'payment';
    label: string;
    status: string;
    time: string;
  }>;
  paymentBreakdown: Array<{ method: string; amount: number; count: number }>;
  topDiagnoses: Array<{ diagnosis: string; count: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}
