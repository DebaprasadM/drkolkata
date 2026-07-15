'use client';

import { Stethoscope, Calendar, Phone, Crown } from 'lucide-react';
import type { PrescriptionTemplateProps } from './types';

export default function TemplateElegant({ rx, formatDate }: PrescriptionTemplateProps) {
  return (
    <div className="bg-[#FDFBF7] overflow-hidden flex flex-col min-h-[calc(100vh-48px)]" style={{ border: '2px solid #C9A96E' }}>
      {/* Decorative corners */}
      <div className="pointer-events-none absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#C9A96E] z-10" />
      <div className="pointer-events-none absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#C9A96E] z-10" />
      <div className="pointer-events-none absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#C9A96E] z-10" />
      <div className="pointer-events-none absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#C9A96E] z-10" />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#2C1810] via-[#3D2317] to-[#2C1810] px-6 sm:px-8 pt-6 pb-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-20 text-[80px] font-serif text-[#C9A96E] select-none">℞</div>
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-[#C9A96E]/20 flex items-center justify-center border border-[#C9A96E]/30">
              <Crown className="h-7 w-7 text-[#C9A96E]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E6D3] tracking-wide font-serif">{rx.clinic?.name || 'Clinic'}</h1>
              {rx.clinic?.address && <p className="text-sm text-[#C9A96E]/70 mt-0.5">{rx.clinic.address}</p>}
              {rx.clinic?.phone && <p className="text-sm text-[#C9A96E]/70 flex items-center gap-1 mt-0.5"><Phone className="h-3.5 w-3.5" /> {rx.clinic.phone}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[#C9A96E]/60 uppercase tracking-[0.2em] font-medium">Prescription</p>
            <p className="text-sm font-bold text-[#F5E6D3] font-mono mt-0.5">{rx.prescriptionNo}</p>
            <p className="text-xs text-[#C9A96E]/70 mt-1 flex items-center justify-end gap-1"><Calendar className="h-3 w-3" /> {formatDate(rx.visit?.visitDate || rx.createdAt)}</p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

      {/* Doctor & Patient */}
      <div className="relative z-[1] px-6 sm:px-8 py-5 border-b border-[#C9A96E]/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold mb-1">Physician</p>
            <p className="text-lg font-bold text-[#2C1810] font-serif">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
            {rx.doctor?.specialization && <p className="text-sm text-[#6B5B3E] mt-0.5">{rx.doctor.specialization}</p>}
          </div>
          <div>
            <p className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold mb-1">Patient</p>
            <p className="text-lg font-bold text-[#2C1810] font-serif">{rx.patient?.firstName} {rx.patient?.lastName}</p>
            <p className="text-sm text-[#6B5B3E] mt-0.5">{rx.patient?.age || 'N/A'} / {rx.patient?.gender}{rx.patient?.bloodGroup && <span className="ml-2 text-[#8B1A1A] font-bold">{rx.patient.bloodGroup}</span>}</p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {rx.diagnosis && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-b border-[#C9A96E]/20">
          <p className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold mb-1">Diagnosis</p>
          <p className="text-base text-[#2C1810] font-medium">{rx.diagnosis}</p>
        </div>
      )}

      {/* Medicines */}
      {rx.medicines && rx.medicines.length > 0 && (
        <div className="relative z-[1] px-6 sm:px-8 py-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#C9A96E]/30">
            <span className="text-2xl font-bold text-[#2C1810] italic font-serif">Rx</span>
            <span className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold ml-1">Medications</span>
          </div>
          <div className="space-y-4">
            {rx.medicines.map((med, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-sm text-[#C9A96E] font-bold font-serif mt-0.5 shrink-0">{i + 1}.</span>
                <div>
                  <p className="text-base font-bold text-[#2C1810]">{med.name}</p>
                  <p className="text-sm text-[#6B5B3E] mt-0.5">{med.dosage} — {med.frequency} — {med.duration}{med.route && <span className="text-[#8B6914] ml-1">({med.route})</span>}</p>
                  {med.instructions && <p className="text-sm text-[#6B5B3E] italic mt-0.5">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rx.investigations && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-t border-[#C9A96E]/20">
          <p className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold mb-1">Investigations</p>
          <p className="text-base text-[#2C1810] whitespace-pre-wrap">{rx.investigations}</p>
        </div>
      )}

      {rx.advice && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-t border-[#C9A96E]/20">
          <p className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold mb-1">Advice</p>
          <p className="text-base text-[#2C1810] whitespace-pre-wrap">{rx.advice}</p>
        </div>
      )}

      {(rx.nextVisitDate) && (
        <div className="px-6 sm:px-8 py-4 border-t border-[#C9A96E]/20 flex flex-wrap gap-6">
          {rx.nextVisitDate && <div><p className="text-[10px] text-[#8B6914] uppercase tracking-[0.2em] font-semibold mb-0.5">Next Follow-up</p><p className="text-base font-bold text-[#2C1810]">{formatDate(rx.nextVisitDate, 'long')}</p></div>}
        </div>
      )}

      <div className="flex-1" />

      {/* Signature */}
      <div className="relative z-[1] px-6 sm:px-8 py-6 border-t border-[#C9A96E]/30">
        <div className="flex justify-end">
          <div className="text-center w-48">
            {rx.doctor?.signature ? (
              <img src={rx.doctor.signature} alt="Doctor Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <div className="border-t border-[#C9A96E] pt-2 mt-1">
              <p className="text-base font-bold text-[#2C1810] font-serif">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
              {rx.doctor?.specialization && <p className="text-sm text-[#6B5B3E]">{rx.doctor.specialization}</p>}
            </div>
          </div>
        </div>
      </div>
      {rx.expiryDate && (
        <div className="px-6 sm:px-8 py-2 text-center bg-[#F5F0E8]/50 border-t border-[#C9A96E]/20">
          <p className="text-[10px] text-[#8B6914]/60 tracking-wide">Please download or save this prescription before {formatDate(rx.expiryDate, 'long')}.</p>
        </div>
      )}
    </div>
  );
}
