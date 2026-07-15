'use client';

import { Calendar, Phone, Stethoscope } from 'lucide-react';
import type { PrescriptionTemplateProps } from './types';

export default function TemplateMinimal({ rx, formatDate }: PrescriptionTemplateProps) {
  return (
    <div className="bg-white flex flex-col min-h-[calc(100vh-48px)]">
      {/* Simple header */}
      <div className="px-8 sm:px-12 pt-8 pb-6 border-b border-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">{rx.clinic?.name || 'Clinic'}</h1>
            {rx.clinic?.address && <p className="text-sm text-slate-500 mt-1">{rx.clinic.address}</p>}
            {rx.clinic?.phone && <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5"><Phone className="h-3.5 w-3.5" /> {rx.clinic.phone}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Date</p>
            <p className="text-sm font-medium text-slate-800 mt-0.5">{formatDate(rx.visit?.visitDate || rx.createdAt)}</p>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Rx No.</p>
            <p className="text-sm font-medium text-slate-800 font-mono mt-0.5">{rx.prescriptionNo}</p>
          </div>
        </div>
      </div>

      {/* Patient & Doctor */}
      <div className="px-8 sm:px-12 py-5 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Patient</p>
            <p className="text-lg font-semibold text-slate-900">{rx.patient?.firstName} {rx.patient?.lastName}</p>
            <p className="text-sm text-slate-500 mt-0.5">{rx.patient?.age || 'N/A'} yrs / {rx.patient?.gender}{rx.patient?.bloodGroup && <span className="ml-2 text-red-500 font-medium">{rx.patient.bloodGroup}</span>}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Physician</p>
            <p className="text-lg font-semibold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
            {rx.doctor?.specialization && <p className="text-sm text-slate-500 mt-0.5">{rx.doctor.specialization}</p>}
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {rx.diagnosis && (
        <div className="px-8 sm:px-12 py-4 border-b border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Diagnosis</p>
          <p className="text-base text-slate-800">{rx.diagnosis}</p>
        </div>
      )}

      {/* Medicines */}
      {rx.medicines && rx.medicines.length > 0 && (
        <div className="px-8 sm:px-12 py-6">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-slate-900 inline-block">Prescription</p>
          <div className="space-y-4">
            {rx.medicines.map((med, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-sm text-slate-400 font-mono mt-0.5 shrink-0 w-5 text-right">{i + 1}.</span>
                <div>
                  <p className="text-base font-semibold text-slate-900">{med.name}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{med.dosage} — {med.frequency} — {med.duration}{med.route && <span className="text-slate-400 ml-1">({med.route})</span>}</p>
                  {med.instructions && <p className="text-sm text-slate-400 italic mt-0.5">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rx.investigations && (
        <div className="px-8 sm:px-12 py-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Investigations</p>
          <p className="text-base text-slate-800 whitespace-pre-wrap">{rx.investigations}</p>
        </div>
      )}

      {rx.advice && (
        <div className="px-8 sm:px-12 py-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Advice</p>
          <p className="text-base text-slate-800 whitespace-pre-wrap">{rx.advice}</p>
        </div>
      )}

      {(rx.nextVisitDate) && (
        <div className="px-8 sm:px-12 py-4 border-t border-slate-100 flex flex-wrap gap-6">
          {rx.nextVisitDate && <div><p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-0.5">Follow-up</p><p className="text-base font-semibold text-slate-900">{formatDate(rx.nextVisitDate, 'long')}</p></div>}
        </div>
      )}

      <div className="flex-1" />

      {/* Signature */}
      <div className="px-8 sm:px-12 py-8 border-t border-slate-900">
        <div className="flex justify-end">
          <div className="text-center w-48">
            {rx.doctor?.signature ? (
              <img src={rx.doctor.signature} alt="Doctor Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <div className="border-t border-slate-300 pt-2 mt-1">
              <p className="text-sm font-semibold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
              {rx.doctor?.specialization && <p className="text-xs text-slate-500">{rx.doctor.specialization}</p>}
            </div>
          </div>
        </div>
      </div>

      {rx.expiryDate && (
        <div className="px-6 sm:px-8 py-2 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 tracking-wide">Please download or save this prescription before {formatDate(rx.expiryDate, 'long')}.</p>
        </div>
      )}
    </div>
  );
}
