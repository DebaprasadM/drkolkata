export interface PrescriptionData {
  prescriptionNo: string;
  diagnosis?: string;
  investigations?: string;
  advice?: string;
  nextVisitDate?: string;
  expiryDate?: string;
  createdAt: string;
  visit?: {
    visitDate?: string;
    tokenNumber?: number;
    consultationType?: string;
  };
  patient?: {
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: string;
    bloodGroup?: string;
    phone?: string;
  };
  doctor?: {
    user?: { firstName?: string; lastName?: string };
    specialization?: string;
    signature?: string;
  };
  medicines?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    route?: string;
    instructions?: string;
  }>;
  clinic?: {
    name?: string;
    address?: string;
    phone?: string;
    logo?: string;
  };
}

export interface PrescriptionTemplateProps {
  rx: PrescriptionData;
  formatDate: (date: string | Date, format?: 'long' | 'short' | 'time') => string;
}
