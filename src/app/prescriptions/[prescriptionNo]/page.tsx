'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Download, Printer, Share2, FileText, AlertCircle } from 'lucide-react';
import { prescriptionTemplates, type TemplateId } from '@/components/prescription-templates';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function PublicPrescriptionPage() {
  const params = useParams();
  const prescriptionNo = params.prescriptionNo as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-prescription', prescriptionNo],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/prescriptions/public/${prescriptionNo}`);
      return res.data.data;
    },
    enabled: !!prescriptionNo,
    retry: false,
  });

  const handlePrint = () => window.print();

  const handleShareWhatsApp = () => {
    const phone = data?.patient?.whatsappNumber || data?.patient?.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const shareUrl = `${window.location.origin}/prescriptions/${prescriptionNo}`;
    const message = encodeURIComponent(
      `Hi ${data?.patient?.firstName},\n\nYour prescription from ${data?.clinic?.name || 'the clinic'} is ready.\n\nPrescription No: ${prescriptionNo}\nDoctor: Dr. ${data?.doctor?.user?.firstName} ${data?.doctor?.user?.lastName}\n\nView your prescription:\n${shareUrl}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-lg font-semibold text-slate-800">Prescription Not Found</p>
          <p className="text-sm text-slate-500">This prescription may have expired or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const templateId: TemplateId = data.prescriptionTemplate?.templateId || 'classic';
  const templateConfig = prescriptionTemplates[templateId] || prescriptionTemplates.classic;
  const TemplateComponent = templateConfig.component;

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .rx-body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .rx-paper { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; width: 100% !important; }
          .rx-paper > div { min-height: auto !important; }
          @page { margin: 8mm; size: A4; }
          .rx-nobreak { page-break-inside: avoid; }
        }
      `}</style>

      <div className="rx-body min-h-screen bg-slate-50">
        {/* Action Bar */}
        <div className="no-print sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Prescription</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{templateConfig.name}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={handlePrint}>
                <Download className="h-3.5 w-3.5 mr-1" /> Save PDF
              </Button>
              <Button size="sm" className="rounded-lg h-8 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={handleShareWhatsApp}>
                <Share2 className="h-3.5 w-3.5 mr-1" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Prescription */}
        <div className="rx-paper max-w-2xl mx-auto my-6 sm:my-8 relative">
          <TemplateComponent rx={data} formatDate={formatDate} />
        </div>
      </div>
    </>
  );
}
