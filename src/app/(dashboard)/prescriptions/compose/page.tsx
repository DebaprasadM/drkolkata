'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, FileText, ArrowLeft, ExternalLink, AlertCircle, Share2 } from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  route: string;
}

const emptyMedicine = (): Medicine => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '', route: 'Oral' });

export default function ComposePrescriptionPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><Skeleton className="h-10 w-72 rounded-lg" /><Skeleton className="h-96 rounded-xl" /></div>}>
      <ComposePrescriptionForm />
    </Suspense>
  );
}

function ComposePrescriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVisitId = searchParams.get('visitId');

  const [visitId, setVisitId] = useState(preselectedVisitId || '');
  const [visitSearch, setVisitSearch] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [investigations, setInvestigations] = useState('');
  const [advice, setAdvice] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([emptyMedicine()]);
  const [createdPrescription, setCreatedPrescription] = useState<any>(null);

  const visitsQuery = useQuery({
    queryKey: ['visits-all'],
    queryFn: async () => {
      const res = await api.get('/visits', { params: { limit: 100 } });
      return res.data.data || [];
    },
  });

  const selectedVisit = visitsQuery.data?.find((v: any) => v.id === visitId);

  const createPrescription = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/prescriptions', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setCreatedPrescription(data);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create prescription', variant: 'destructive' });
    },
  });

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, emptyMedicine()]);
  const removeMedicine = (index: number) => {
    if (medicines.length > 1) setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitId) return;
    const validMedicines = medicines.filter((m) => m.name && m.dosage && m.frequency && m.duration);
    if (validMedicines.length === 0) {
      toast({ title: 'Validation Error', description: 'Please fill in name, dosage, frequency, and duration for at least one medicine', variant: 'destructive' });
      return;
    }

    createPrescription.mutate({
      visitId,
      diagnosis: diagnosis || undefined,
      clinicalNotes: clinicalNotes || undefined,
      investigations: investigations || undefined,
      advice: advice || undefined,
      nextVisitDate: nextVisitDate || undefined,
      medicines: validMedicines,
    });
  };

  if (createdPrescription) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Prescription Created</h2>
          <p className="text-sm text-[#475569]">Prescription has been generated successfully</p>
        </div>

        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
              <FileText className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0F172A]">{createdPrescription.prescriptionNo}</p>
              <p className="text-sm text-[#475569]">
                {createdPrescription.patient?.firstName} {createdPrescription.patient?.lastName}
                {' | '}{createdPrescription.medicines?.length || 0} medicines
              </p>
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              <a href={`/prescriptions/${createdPrescription.prescriptionNo}`} target="_blank" rel="noopener noreferrer">
                <Button className="rounded-lg">
                  <ExternalLink className="mr-2 h-4 w-4" /> View Prescription
                </Button>
              </a>
              <Button variant="outline" className="rounded-lg border-[#E2E8F0] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800" onClick={() => {
                const phone = createdPrescription.patient?.whatsappNumber || createdPrescription.patient?.phone || '';
                const cleanPhone = phone.replace(/[^0-9]/g, '');
                const shareUrl = `${window.location.origin}/prescriptions/${createdPrescription.prescriptionNo}`;
                const message = encodeURIComponent(`Hi ${createdPrescription.patient?.firstName},\n\nYour prescription is ready.\n\nPrescription No: ${createdPrescription.prescriptionNo}\n\nView:\n${shareUrl}`);
                window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
              }}>
                <Share2 className="mr-2 h-4 w-4" /> Share WhatsApp
              </Button>
              <Button variant="outline" className="rounded-lg border-[#E2E8F0]" onClick={() => router.push('/prescriptions')}>
                View All
              </Button>
            </div>
            <Button variant="ghost" className="text-[#475569]" onClick={() => { setCreatedPrescription(null); setMedicines([emptyMedicine()]); setDiagnosis(''); setClinicalNotes(''); setInvestigations(''); setAdvice(''); setNextVisitDate(''); }}>
              Write Another Prescription
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Write Prescription</h2>
          <p className="text-sm text-[#475569]">Compose and generate a new prescription</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="rounded-lg border-[#E2E8F0]" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button type="submit" disabled={!visitId || medicines.every((m) => !m.name) || createPrescription.isPending} className="rounded-lg">
            <Save className="mr-2 h-4 w-4" /> {createPrescription.isPending ? 'Generating...' : 'Generate Prescription'}
          </Button>
        </div>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Select Visit</h3>
          {visitsQuery.isLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <select
              className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A]"
              value={visitId}
              onChange={(e) => setVisitId(e.target.value)}
              required
            >
              <option value="">-- Select a visit --</option>
              {visitsQuery.data?.map((v: any) => (
                <option key={v.id} value={v.id}>
                  Token #{v.tokenNumber} | {v.patient?.firstName} {v.patient?.lastName} | Dr. {v.doctor?.user?.firstName} {v.doctor?.user?.lastName} | {v.status}
                </option>
              ))}
            </select>
          )}

          {selectedVisit && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#475569]">Patient</p>
                <p className="text-sm font-medium text-[#0F172A]">{selectedVisit.patient?.firstName} {selectedVisit.patient?.lastName}</p>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#475569]">Doctor</p>
                <p className="text-sm font-medium text-[#0F172A]">Dr. {selectedVisit.doctor?.user?.firstName} {selectedVisit.doctor?.user?.lastName}</p>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#475569]">Token</p>
                <p className="text-sm font-medium text-[#0F172A]">#{selectedVisit.tokenNumber}</p>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#475569]">Status</p>
                <Badge className="mt-0.5 text-xs">{selectedVisit.status?.replace('_', ' ')}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Clinical Details</h3>
            <div>
              <label className="text-sm font-medium text-[#0F172A]">Diagnosis</label>
              <textarea
                className="mt-1 flex min-h-[80px] w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-muted-foreground"
                placeholder="Enter diagnosis..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A]">Clinical Notes</label>
              <textarea
                className="mt-1 flex min-h-[80px] w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-muted-foreground"
                placeholder="Clinical observations..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A]">Investigations</label>
              <textarea
                className="mt-1 flex min-h-[80px] w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-muted-foreground"
                placeholder="Recommended investigations/tests..."
                value={investigations}
                onChange={(e) => setInvestigations(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Advice & Follow-up</h3>
            <div>
              <label className="text-sm font-medium text-[#0F172A]">Advice / Instructions</label>
              <textarea
                className="mt-1 flex min-h-[120px] w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-muted-foreground"
                placeholder="Diet, lifestyle advice, precautions..."
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0F172A]">Next Visit Date</label>
              <Input
                type="date"
                className="mt-1 rounded-lg border-[#E2E8F0]"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Medicines</h3>
            <Button type="button" variant="outline" size="sm" onClick={addMedicine} className="rounded-lg border-[#E2E8F0]">
              <Plus className="mr-1.5 h-4 w-4" /> Add Medicine
            </Button>
          </div>

          {medicines.map((med, index) => (
            <div key={index} className="rounded-lg border border-[#E2E8F0] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#475569] uppercase">Medicine #{index + 1}</span>
                {medicines.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeMedicine(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-xs text-[#475569]">Medicine Name *</label>
                  <Input placeholder="e.g. Amoxicillin" className="mt-1 rounded-lg border-[#E2E8F0]" value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs text-[#475569]">Dosage *</label>
                  <Input placeholder="e.g. 500mg" className="mt-1 rounded-lg border-[#E2E8F0]" value={med.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs text-[#475569]">Frequency *</label>
                  <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={med.frequency} onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)} required>
                    <option value="">Select</option>
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="Four Times Daily">Four Times Daily</option>
                    <option value="Every 6 Hours">Every 6 Hours</option>
                    <option value="Every 8 Hours">Every 8 Hours</option>
                    <option value="Every 12 Hours">Every 12 Hours</option>
                    <option value="At Bedtime">At Bedtime</option>
                    <option value="As Needed">As Needed</option>
                    <option value="Before Meals">Before Meals</option>
                    <option value="After Meals">After Meals</option>
                    <option value="On Empty Stomach">On Empty Stomach</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#475569]">Duration *</label>
                  <Input placeholder="e.g. 7 days" className="mt-1 rounded-lg border-[#E2E8F0]" value={med.duration} onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs text-[#475569]">Route</label>
                  <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={med.route} onChange={(e) => handleMedicineChange(index, 'route', e.target.value)}>
                    <option value="Oral">Oral</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Rectal">Rectal</option>
                    <option value="Ophthalmic">Ophthalmic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#475569]">Instructions</label>
                  <Input placeholder="e.g. After meals" className="mt-1 rounded-lg border-[#E2E8F0]" value={med.instructions} onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button type="button" variant="outline" className="rounded-lg border-[#E2E8F0]" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={!visitId || medicines.every((m) => !m.name) || createPrescription.isPending} className="rounded-lg">
          <Save className="mr-2 h-4 w-4" /> {createPrescription.isPending ? 'Generating...' : 'Generate Prescription'}
        </Button>
      </div>
    </form>
  );
}
