'use client';

import { Stethoscope, Calendar, Phone, Heart, Pill, FileText } from 'lucide-react';
import type { PrescriptionTemplateProps } from './types';

export default function TemplateModern({ rx, formatDate }: PrescriptionTemplateProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 sm:px-8 pt-6 pb-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-300/30 blur-2xl" />
        </div>
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{rx.clinic?.name || 'Clinic'}</h1>
              {rx.clinic?.address && <p className="text-sm text-purple-100 mt-0.5">{rx.clinic.address}</p>}
              {rx.clinic?.phone && <p className="text-sm text-purple-100 flex items-center gap-1 mt-0.5"><Phone className="h-3.5 w-3.5" /> {rx.clinic.phone}</p>}
            </div>
          </div>
          <div className="text-right shrink-0 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5">
            <p className="text-[10px] text-purple-200 uppercase tracking-wider font-medium">Prescription</p>
            <p className="text-sm font-bold text-white font-mono mt-0.5">{rx.prescriptionNo}</p>
            <p className="text-xs text-purple-200 mt-1 flex items-center justify-end gap-1"><Calendar className="h-3 w-3" /> {formatDate(rx.visit?.visitDate || rx.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Doctor & Patient */}
      <div className="px-6 sm:px-8 py-5 -mt-1 relative z-[1]">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-violet-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center"><Stethoscope className="h-3.5 w-3.5 text-violet-600" /></div>
              <span className="text-xs font-semibold text-violet-500 uppercase">Doctor</span>
            </div>
            <p className="text-lg font-bold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
            {rx.doctor?.specialization && <p className="text-sm text-slate-500 mt-0.5">{rx.doctor.specialization}</p>}
          </div>
          <div className="bg-white rounded-xl border border-pink-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-pink-100 flex items-center justify-center"><Heart className="h-3.5 w-3.5 text-pink-500" /></div>
              <span className="text-xs font-semibold text-pink-500 uppercase">Patient</span>
            </div>
            <p className="text-lg font-bold text-slate-900">{rx.patient?.firstName} {rx.patient?.lastName}</p>
            <p className="text-sm text-slate-500">{rx.patient?.age || 'N/A'} / {rx.patient?.gender}{rx.patient?.bloodGroup && <span className="ml-2 text-red-500 font-semibold">{rx.patient.bloodGroup}</span>}</p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      {rx.diagnosis && (
        <div className="px-6 sm:px-8 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Diagnosis</p>
            <p className="text-base font-medium text-slate-900">{rx.diagnosis}</p>
          </div>
        </div>
      )}

      {/* Medicines */}
      {rx.medicines && rx.medicines.length > 0 && (
        <div className="px-6 sm:px-8 py-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
            <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center"><Pill className="h-3.5 w-3.5 text-violet-600" /></div>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Medications</span>
            <span className="ml-auto text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">{rx.medicines.length} items</span>
          </div>
          <div className="space-y-3">
            {rx.medicines.map((med, i) => {
              const accents = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];
              const tags = ['bg-blue-50 text-blue-700 border-blue-100', 'bg-violet-50 text-violet-700 border-violet-100', 'bg-emerald-50 text-emerald-700 border-emerald-100', 'bg-rose-50 text-rose-700 border-rose-100', 'bg-amber-50 text-amber-700 border-amber-100', 'bg-cyan-50 text-cyan-700 border-cyan-100'];
              const ci = i % accents.length;
              return (
                <div key={i} className="flex gap-3 bg-white rounded-xl border border-slate-100 p-3.5">
                  <div className={`h-8 w-8 shrink-0 rounded-lg ${accents[ci]} flex items-center justify-center text-white text-xs font-bold`}>{i + 1}</div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900">{med.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${tags[ci]}`}>{med.dosage}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">{med.frequency}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">{med.duration}</span>
                    </div>
                    {med.instructions && <p className="text-xs text-slate-500 italic mt-1.5">{med.instructions}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rx.investigations && (
        <div className="px-6 sm:px-8 py-4">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wide mb-1">Investigations</p>
            <p className="text-base font-medium text-slate-900 whitespace-pre-wrap">{rx.investigations}</p>
          </div>
        </div>
      )}

      {rx.advice && (
        <div className="px-6 sm:px-8 py-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Advice</p>
            <p className="text-base font-medium text-slate-900 whitespace-pre-wrap">{rx.advice}</p>
          </div>
        </div>
      )}

      {(rx.nextVisitDate) && (
        <div className="px-6 sm:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            {rx.nextVisitDate && <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><span className="text-xs font-semibold text-blue-500 uppercase">Next Follow-up</span><p className="text-lg font-bold text-slate-900 mt-0.5">{formatDate(rx.nextVisitDate, 'long')}</p></div>}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <div className="px-6 sm:px-8 py-6">
        <div className="flex justify-end">
          <div className="text-center w-48">
            {rx.doctor?.signature ? (
              <img src={rx.doctor.signature} alt="Doctor Signature" className="h-12 mx-auto object-contain" />
            ) : (
              <div className="h-12" />
            )}
            <div className="border-t-2 border-dashed border-violet-300 pt-2 mt-1">
              <p className="text-base font-bold text-slate-900">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</p>
              {rx.doctor?.specialization && <p className="text-sm text-slate-500">{rx.doctor.specialization}</p>}
            </div>
          </div>
        </div>
      </div>
      {rx.expiryDate && (
        <div className="px-6 sm:px-8 py-2 text-center bg-violet-50/50 border-t border-violet-100">
          <p className="text-[10px] text-slate-400 tracking-wide">Please download or save this prescription before {formatDate(rx.expiryDate, 'long')}.</p>
        </div>
      )}
    </div>
  );
}
