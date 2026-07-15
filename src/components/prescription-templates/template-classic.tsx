'use client';

import { Stethoscope, Calendar, Phone, FileText } from 'lucide-react';
import type { PrescriptionTemplateProps } from './types';

export default function TemplateClassic({ rx, formatDate }: PrescriptionTemplateProps) {
  return (
    <div className="bg-white shadow-sm overflow-hidden relative flex flex-col min-h-[calc(100vh-48px)]" style={{ border: '3px solid #1e3a5f' }}>
      <div className="pointer-events-none absolute inset-1 border border-blue-200/60 rounded-sm z-10" />
      <div className="pointer-events-none absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-blue-400 z-10" />
      <div className="pointer-events-none absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-blue-400 z-10" />
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-blue-400 z-10" />
      <div className="pointer-events-none absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-blue-400 z-10" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[280px] font-serif italic font-bold text-blue-100 select-none leading-none">Rx</div>
        <div className="absolute top-10 right-10 text-[120px] font-serif italic font-bold text-blue-100/70 select-none leading-none rotate-12">℞</div>
        <div className="absolute bottom-20 left-10 text-[80px] font-serif italic font-bold text-blue-100/50 select-none leading-none -rotate-12">Rx</div>
      </div>

      <div className="relative z-[1] bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-6 sm:px-8 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight tracking-tight">{rx.clinic?.name || 'Clinic'}</h1>
              {rx.clinic?.address && <p className="text-xs text-blue-200 mt-0.5">{rx.clinic.address}</p>}
              {rx.clinic?.phone && <p className="text-xs text-blue-200 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {rx.clinic.phone}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-blue-300 uppercase tracking-wider font-medium">Prescription No.</p>
            <p className="text-sm font-bold text-white font-mono">{rx.prescriptionNo}</p>
            <p className="text-xs text-blue-200 mt-1 flex items-center justify-end gap-1"><Calendar className="h-3 w-3" /> {formatDate(rx.visit?.visitDate || rx.createdAt)}</p>
          </div>
        </div>
      </div>
      <div className="relative z-[1] h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

      <div className="relative z-[1] rx-nobreak border-b border-slate-200 px-6 sm:px-8 py-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Doctor</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
            {rx.doctor?.specialization && <p className="text-sm text-slate-600 mt-0.5">{rx.doctor.specialization}</p>}
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Patient</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{rx.patient?.firstName} {rx.patient?.lastName}</p>
            <p className="text-sm text-slate-600">{rx.patient?.age || 'N/A'} / {rx.patient?.gender}{rx.patient?.bloodGroup && <span className="ml-2 text-red-600 font-bold">{rx.patient.bloodGroup}</span>}</p>
          </div>
        </div>
      </div>

      {rx.diagnosis && (
        <div className="relative z-[1] rx-nobreak border-b border-slate-200 px-6 sm:px-8 py-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Diagnosis</p>
          <p className="text-base font-medium text-slate-900">{rx.diagnosis}</p>
        </div>
      )}

      {rx.medicines && rx.medicines.length > 0 && (
        <div className="relative z-[1] rx-nobreak px-6 sm:px-8 py-5">
          <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-200">
            <span className="text-2xl font-bold text-slate-900 italic font-serif">Rx</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide ml-1">Medications</span>
          </div>
          <div className="space-y-5">
            {rx.medicines.map((med, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-sm font-bold text-slate-500 mt-0.5 shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <p className="text-base font-bold text-slate-900">{med.name}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{med.dosage} &mdash; {med.frequency} &mdash; {med.duration}{med.route && <span className="ml-1 text-slate-500 font-medium">({med.route})</span>}</p>
                  {med.instructions && <p className="text-sm text-slate-600 italic mt-0.5">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rx.investigations && (
        <div className="relative z-[1] rx-nobreak border-t border-slate-200 px-6 sm:px-8 py-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Investigations</p>
          <p className="text-base font-medium text-slate-900 whitespace-pre-wrap">{rx.investigations}</p>
        </div>
      )}

      {rx.advice && (
        <div className="relative z-[1] rx-nobreak border-t border-slate-200 px-6 sm:px-8 py-5">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Advice</p>
          <p className="text-base font-medium text-slate-900 whitespace-pre-wrap">{rx.advice}</p>
        </div>
      )}

      {(rx.nextVisitDate) && (
        <div className="relative z-[1] rx-nobreak border-t border-slate-200 px-6 sm:px-8 py-5">
          <div className="flex flex-wrap gap-4">
            {rx.nextVisitDate && <div><span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Next Follow-up</span><p className="text-lg font-bold text-slate-900 mt-0.5">{formatDate(rx.nextVisitDate, 'long')}</p></div>}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <div className="relative z-[1] rx-nobreak border-t border-slate-200 px-6 sm:px-8 py-6">
        <div className="flex justify-end">
          <div className="text-center w-48">
            {rx.doctor?.signature ? (
              <img src={rx.doctor.signature} alt="Doctor Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <div className="border-t-2 border-slate-400 pt-2 mt-1">
              <p className="text-base font-bold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
              {rx.doctor?.specialization && <p className="text-sm text-slate-600">{rx.doctor.specialization}</p>}
            </div>
          </div>
        </div>
      </div>
      {rx.expiryDate && (
        <div className="relative z-[1] bg-slate-50 border-t border-slate-200 px-6 sm:px-8 py-2 text-center">
          <p className="text-[10px] text-slate-400 tracking-wide">Please download or save this prescription before {formatDate(rx.expiryDate, 'long')}.</p>
        </div>
      )}
    </div>
  );
}
