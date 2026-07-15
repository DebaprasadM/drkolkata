'use client';

import { Stethoscope, Calendar, Phone, Shield, Plus } from 'lucide-react';
import type { PrescriptionTemplateProps } from './types';

export default function TemplateMedical({ rx, formatDate }: PrescriptionTemplateProps) {
  return (
    <div className="bg-white overflow-hidden flex flex-col min-h-[calc(100vh-48px)]" style={{ border: '3px solid #047857' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 px-6 sm:px-8 pt-5 pb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 text-[100px] text-white select-none leading-none">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L12 22M2 12L22 12" strokeWidth="3" stroke="currentColor"/></svg>
          </div>
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{rx.clinic?.name || 'Clinic'}</h1>
              {rx.clinic?.address && <p className="text-xs text-emerald-200 mt-0.5">{rx.clinic.address}</p>}
              {rx.clinic?.phone && <p className="text-xs text-emerald-200 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {rx.clinic.phone}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5">
              <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Rx</span>
              <span className="text-sm font-bold text-white font-mono">{rx.prescriptionNo}</span>
            </div>
            <p className="text-xs text-emerald-200 mt-1.5 flex items-center justify-end gap-1"><Calendar className="h-3 w-3" /> {formatDate(rx.visit?.visitDate || rx.createdAt)}</p>
          </div>
        </div>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

      {/* Doctor & Patient */}
      <div className="relative z-[1] px-6 sm:px-8 py-5 border-b border-emerald-100">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Doctor</span>
            </div>
            <p className="text-lg font-bold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
            {rx.doctor?.specialization && <p className="text-sm text-slate-500 mt-0.5">{rx.doctor.specialization}</p>}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Patient</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{rx.patient?.firstName} {rx.patient?.lastName}</p>
            <p className="text-sm text-slate-500">{rx.patient?.age || 'N/A'} / {rx.patient?.gender}{rx.patient?.bloodGroup && <span className="ml-2 text-red-600 font-bold">{rx.patient.bloodGroup}</span>}</p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {rx.diagnosis && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-b border-emerald-100 bg-emerald-50/50">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Diagnosis</p>
          <p className="text-base font-medium text-slate-900">{rx.diagnosis}</p>
        </div>
      )}

      {/* Medicines */}
      {rx.medicines && rx.medicines.length > 0 && (
        <div className="relative z-[1] px-6 sm:px-8 py-5">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-200">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center"><Plus className="h-4 w-4 text-white" /></div>
            <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Medications</span>
            <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">{rx.medicines.length}</span>
          </div>
          <div className="space-y-4">
            {rx.medicines.map((med, i) => (
              <div key={i} className="flex gap-3 border-l-3 border-emerald-400 pl-4 py-1" style={{ borderLeftWidth: '3px' }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-500">{i + 1}.</span>
                    <p className="text-base font-bold text-slate-900">{med.name}</p>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 ml-4">{med.dosage} — {med.frequency} — {med.duration}{med.route && <span className="text-emerald-500 font-medium ml-1">({med.route})</span>}</p>
                  {med.instructions && <p className="text-sm text-slate-500 italic mt-0.5 ml-4">{med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rx.investigations && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-t border-emerald-100 bg-emerald-50/30">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Investigations</p>
          <p className="text-base font-medium text-slate-900 whitespace-pre-wrap">{rx.investigations}</p>
        </div>
      )}

      {rx.advice && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-t border-emerald-100">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Advice</p>
          <p className="text-base font-medium text-slate-900 whitespace-pre-wrap">{rx.advice}</p>
        </div>
      )}

      {(rx.nextVisitDate) && (
        <div className="relative z-[1] px-6 sm:px-8 py-4 border-t border-emerald-100 flex flex-wrap gap-4">
          {rx.nextVisitDate && <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2"><span className="text-xs font-bold text-emerald-600 uppercase">Next Visit</span><p className="text-base font-bold text-slate-900 mt-0.5">{formatDate(rx.nextVisitDate, 'long')}</p></div>}
        </div>
      )}

      <div className="flex-1" />

      {/* Signature */}
      <div className="relative z-[1] px-6 sm:px-8 py-6 border-t-2 border-emerald-200">
        <div className="flex justify-end">
          <div className="text-center w-48">
            {rx.doctor?.signature ? (
              <img src={rx.doctor.signature} alt="Doctor Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <div className="border-t-2 border-emerald-300 pt-2 mt-1">
              <p className="text-base font-bold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
              {rx.doctor?.specialization && <p className="text-sm text-slate-500">{rx.doctor.specialization}</p>}
            </div>
          </div>
        </div>
      </div>
      {rx.expiryDate && (
        <div className="px-6 sm:px-8 py-2 text-center bg-emerald-50/50 border-t border-emerald-100">
          <p className="text-[10px] text-slate-400 tracking-wide">Please download or save this prescription before {formatDate(rx.expiryDate, 'long')}.</p>
        </div>
      )}
    </div>
  );
}
