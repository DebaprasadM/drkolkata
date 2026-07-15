'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusColor } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, ArrowRight, CheckCircle2, SkipForward, FileText, Eye, Loader2, Calendar, X, PenSquare, UserPlus } from 'lucide-react';
import type { Visit } from '@/types';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VisitsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [visitFormKey, setVisitFormKey] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['visits', search, filter, dateFrom, dateTo],
    queryFn: async () => {
      const params: any = { search, limit: 50 };
      if (filter === 'no-rx') params.hasPrescription = 'false';
      else if (filter === 'due') params.paymentStatus = 'PENDING';
      else if (filter !== 'all') params.status = filter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await api.get('/visits', { params });
      return res.data.data as Visit[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/visits/${id}/status`, { status });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['visits'] }); },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Status update failed', variant: 'destructive' }),
  });

  const queueStats = useQuery({
    queryKey: ['queue-stats'],
    queryFn: async () => {
      const res = await api.get('/queue/stats');
      return res.data.data;
    },
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-full sm:w-72 rounded-lg" /><Skeleton className="h-96 rounded-xl" /></div>;

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">OPD Visits</h2>
        <p className="text-sm text-[#475569]">Manage patient visits and queue</p>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-4">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-3 sm:p-5 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">{queueStats.data?.waiting || 0}</p>
            <p className="text-[10px] sm:text-xs font-medium text-[#475569] mt-1">Waiting</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-3 sm:p-5 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{queueStats.data?.inConsultation || 0}</p>
            <p className="text-[10px] sm:text-xs font-medium text-[#475569] mt-1">In Consultation</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-3 sm:p-5 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{queueStats.data?.completed || 0}</p>
            <p className="text-[10px] sm:text-xs font-medium text-[#475569] mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-3 sm:p-5 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A]">{queueStats.data?.total || 0}</p>
            <p className="text-[10px] sm:text-xs font-medium text-[#475569] mt-1">Total Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search patients..." className="pl-9 h-10 rounded-lg border-[#E2E8F0]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full sm:w-40 pl-9 h-10 rounded-lg border-[#E2E8F0]" />
            </div>
            <span className="text-[#475569] text-sm shrink-0">to</span>
            <div className="relative flex-1 sm:flex-none min-w-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full sm:w-40 pl-9 h-10 rounded-lg border-[#E2E8F0]" />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg shrink-0" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                <X className="h-4 w-4 text-[#475569]" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="overflow-x-auto min-w-0 -mb-1">
            <Tabs value={filter} onValueChange={setFilter} className="w-auto">
              <TabsList className="rounded-lg">
                <TabsTrigger value="all" className="rounded-md">All</TabsTrigger>
                <TabsTrigger value="WAITING" className="rounded-md">Waiting</TabsTrigger>
                <TabsTrigger value="IN_CONSULTATION" className="rounded-md">Active</TabsTrigger>
                <TabsTrigger value="COMPLETED" className="rounded-md">Completed</TabsTrigger>
                <TabsTrigger value="no-rx" className="rounded-md text-amber-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700">Rx Pending</TabsTrigger>
                <TabsTrigger value="due" className="rounded-md text-red-600 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Due</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
          <DialogTrigger asChild><Button className="rounded-lg shrink-0"><Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">New Visit</span><span className="sm:hidden">New</span></Button></DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New OPD Visit</DialogTitle></DialogHeader>
            {visitDialogOpen && (
              <Tabs defaultValue="new" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="new" className="flex-1">New Patient</TabsTrigger>
                  <TabsTrigger value="existing" className="flex-1">Existing Patient</TabsTrigger>
                </TabsList>
                <TabsContent value="new">
                  <NewPatientVisitForm key={`new-${visitFormKey}`} onSuccess={() => { setVisitDialogOpen(false); setVisitFormKey((k) => k + 1); queryClient.invalidateQueries({ queryKey: ['visits'] }); queryClient.invalidateQueries({ queryKey: ['queue-stats'] }); queryClient.invalidateQueries({ queryKey: ['patients'] }); }} />
                </TabsContent>
                <TabsContent value="existing">
                  <VisitForm key={`existing-${visitFormKey}`} onSuccess={() => { setVisitDialogOpen(false); setVisitFormKey((k) => k + 1); queryClient.invalidateQueries({ queryKey: ['visits'] }); queryClient.invalidateQueries({ queryKey: ['queue-stats'] }); }} />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-[#E2E8F0]">
            {data?.map((visit) => (
              <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    {visit.tokenNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#0F172A] truncate">{visit.patient?.firstName} {visit.patient?.lastName}</p>
                    <p className="text-xs text-[#475569]">
                      <span className="hidden sm:inline">Dr. {visit.doctor?.user?.firstName} {visit.doctor?.user?.lastName} | {visit.consultationType} | Token #{visit.tokenNumber}</span>
                      <span className="sm:hidden">Dr. {visit.doctor?.user?.firstName} {visit.doctor?.user?.lastName} | {visit.consultationType}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link href={`/patients/${visit.patientId}`}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary group" title="View Patient Profile">
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                  <Badge className={getStatusColor(visit.status)}>{visit.status.replace('_', ' ')}</Badge>
                  <div className="flex gap-1">
                    {visit.status === 'WAITING' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" onClick={() => updateStatus.mutate({ id: visit.id, status: 'IN_CONSULTATION' })} title="Start Consultation">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50" onClick={() => updateStatus.mutate({ id: visit.id, status: 'SKIPPED' })} title="Skip">
                          <SkipForward className="h-4 w-4 text-amber-600" />
                        </Button>
                      </>
                    )}
                    {visit.status === 'IN_CONSULTATION' && (
                      <>
                        <Link href={`/prescriptions/compose?visitId=${visit.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10" title="Write Prescription">
                            <FileText className="h-4 w-4 text-primary" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50" onClick={() => updateStatus.mutate({ id: visit.id, status: 'COMPLETED' })} title="Complete">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </Button>
                      </>
                    )}
                    {!visit.prescription && !['WAITING', 'IN_CONSULTATION'].includes(visit.status) && (
                      <Link href={`/prescriptions/compose?visitId=${visit.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-50" title="Write Prescription">
                          <PenSquare className="h-4 w-4 text-amber-600" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!data || data.length === 0) && (
              <p className="p-8 text-center text-[#475569]">No visits found for today</p>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function NewPatientVisitForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'MALE', phone: '', email: '', address: '', bloodGroup: '',
    doctorId: '', consultationType: 'GENERAL', symptoms: '',
    payment: { amount: 0, discount: 0, paymentMethod: 'CASH', paymentStatus: 'PAID' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doctors = useQuery({
    queryKey: ['doctors-available'],
    queryFn: async () => { const res = await api.get('/doctors/available'); return res.data.data; },
  });

  const feesQuery = useQuery({
    queryKey: ['settings-fees'],
    queryFn: async () => { const res = await api.get('/settings/consultation-fees'); return res.data.data; },
    staleTime: 60000,
  });

  const feeMap: Record<string, number> = {
    GENERAL: feesQuery.data?.general || 0,
    FOLLOW_UP: feesQuery.data?.followUp || 0,
    EMERGENCY: feesQuery.data?.emergency || 0,
  };

  const updateConsultationType = (type: string) => {
    setForm({ ...form, consultationType: type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        firstName: form.firstName, lastName: form.lastName, gender: form.gender, phone: form.phone,
        doctorId: form.doctorId, consultationType: form.consultationType,
      };
      if (form.bloodGroup) payload.bloodGroup = form.bloodGroup;
      if (form.email) payload.email = form.email;
      if (form.address) payload.address = form.address;
      if (form.symptoms) payload.symptoms = form.symptoms;
      if (form.payment.amount > 0) payload.payment = form.payment;
      await api.post('/patients/register-opd', payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input placeholder="First Name *" className="rounded-lg border-[#E2E8F0]" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        <Input placeholder="Last Name *" className="rounded-lg border-[#E2E8F0]" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A]" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
        </select>
        <Input placeholder="Phone *" className="rounded-lg border-[#E2E8F0]" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Input placeholder="Email" type="email" className="rounded-lg border-[#E2E8F0]" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="Blood Group" className="rounded-lg border-[#E2E8F0]" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
        <Input placeholder="Address" className="col-span-1 sm:col-span-2 rounded-lg border-[#E2E8F0]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
        <p className="text-sm font-semibold text-[#0F172A]">OPD Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#475569]">Doctor *</label>
            <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.doctorId} onChange={(e) => { const d = doctors.data?.find((doc: any) => doc.id === e.target.value); setForm({ ...form, doctorId: e.target.value, payment: { ...form.payment, amount: d?.consultationFee || 0 } }); }} required>
              <option value="">{doctors.isLoading ? 'Loading doctors...' : 'Select Doctor'}</option>
              {doctors.data?.map((d: any) => <option key={d.id} value={d.id}>Dr. {d.user?.firstName} {d.user?.lastName} ({d.specialization})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#475569]">Consultation Type</label>
            <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.consultationType} onChange={(e) => updateConsultationType(e.target.value)}>
              <option value="GENERAL">General</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
          <Input placeholder="Symptoms (optional)" className="rounded-lg border-[#E2E8F0] sm:col-span-2" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] pt-4">
        <p className="text-sm font-medium text-[#0F172A] mb-3">Payment</p>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="text-xs text-[#475569]">Fees</label>
            <Input type="number" placeholder="0" className="rounded-lg border-[#E2E8F0] mt-1 bg-[#F8FAFC]" value={form.payment.amount} readOnly />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="text-xs text-[#475569]">Discount</label>
            <Input type="number" placeholder="0" className="rounded-lg border-[#E2E8F0] mt-1" value={form.payment.discount} onChange={(e) => setForm({ ...form, payment: { ...form.payment, discount: Number(e.target.value) } })} />
          </div>
          <div className="col-span-2 sm:col-span-2">
            <label className="text-xs text-[#475569]">Total</label>
            <div className="h-10 mt-1 rounded-lg border border-[#E2E8F0] bg-[#F0FDF4] px-3 flex items-center justify-between">
              <span className="text-xs text-[#475569]">₹</span>
              <span className="text-lg font-bold text-emerald-700">{Math.max(0, (form.payment.amount || 0) - (form.payment.discount || 0))}</span>
            </div>
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label className="text-xs text-[#475569]">Method</label>
            <select className="flex h-10 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.payment.paymentMethod} onChange={(e) => setForm({ ...form, payment: { ...form.payment, paymentMethod: e.target.value } })}>
              <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option><option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label className="text-xs text-[#475569]">Status</label>
            <select className="flex h-10 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.payment.paymentStatus} onChange={(e) => setForm({ ...form, payment: { ...form.payment, paymentStatus: e.target.value } })}>
              <option value="PAID">Paid</option><option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading || !form.doctorId} className="w-full rounded-lg">
        {loading ? 'Registering...' : 'Register & Create OPD Visit'}
      </Button>
    </form>
  );
}

function VisitForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ patientId: '', doctorId: '', consultationType: 'GENERAL', symptoms: '', payment: { amount: 0, discount: 0, paymentMethod: 'CASH', paymentStatus: 'PAID' } });
  const [patientSearch, setPatientSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const patients = useQuery({
    queryKey: ['patient-search', patientSearch],
    queryFn: async () => { const res = await api.get('/patients/search', { params: { q: patientSearch } }); return res.data.data; },
  });

  const doctors = useQuery({
    queryKey: ['doctors-available'],
    queryFn: async () => { const res = await api.get('/doctors/available'); return res.data.data; },
  });

  const feesQuery = useQuery({
    queryKey: ['settings-fees'],
    queryFn: async () => { const res = await api.get('/settings/consultation-fees'); return res.data.data; },
    staleTime: 60000,
  });

  const feeMap: Record<string, number> = {
    GENERAL: feesQuery.data?.general || 0,
    FOLLOW_UP: feesQuery.data?.followUp || 0,
    EMERGENCY: feesQuery.data?.emergency || 0,
  };

  const updateConsultationType = (type: string) => {
    setForm({ ...form, consultationType: type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        patientId: form.patientId, doctorId: form.doctorId,
        consultationType: form.consultationType, symptoms: form.symptoms,
      };
      if (form.payment.amount > 0) payload.payment = form.payment;
      await api.post('/visits', payload);
      onSuccess();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Visit creation failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[#0F172A]">Search Patient</label>
        <Input placeholder="Search by name or phone..." className="mt-1 rounded-lg border-[#E2E8F0]" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
        {patients.data && (
          <div className="mt-1 max-h-32 overflow-y-auto border border-[#E2E8F0] rounded-lg bg-white">
            {patients.data.map((p: any) => (
              <div key={p.id} className={`p-2.5 text-sm cursor-pointer hover:bg-[#F8FAFC] transition-colors ${form.patientId === p.id ? 'bg-primary/5' : ''}`} onClick={() => { setForm({ ...form, patientId: p.id }); setPatientSearch(`${p.firstName} ${p.lastName} - ${p.phone}`); }}>
                {p.firstName} {p.lastName} - {p.phone}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-[#0F172A]">Doctor</label>
          <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.doctorId} onChange={(e) => { const d = doctors.data?.find((doc: any) => doc.id === e.target.value); setForm({ ...form, doctorId: e.target.value, payment: { ...form.payment, amount: d?.consultationFee || 0 } }); }} required>
            <option value="">Select Doctor</option>
            {doctors.data?.map((d: any) => <option key={d.id} value={d.id}>Dr. {d.user.firstName} {d.user.lastName} ({d.specialization})</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[#0F172A]">Consultation Type</label>
          <select className="flex h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.consultationType} onChange={(e) => updateConsultationType(e.target.value)}>
            <option value="GENERAL">General</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>
      <Input placeholder="Symptoms (optional)" className="rounded-lg border-[#E2E8F0]" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
      <div className="border-t border-[#E2E8F0] pt-4">
        <p className="text-sm font-medium text-[#0F172A] mb-3">Payment</p>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <label className="text-xs text-[#475569]">Fees</label>
            <Input type="number" placeholder="0" className="rounded-lg border-[#E2E8F0] mt-1 bg-[#F8FAFC]" value={form.payment.amount} readOnly />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className="text-xs text-[#475569]">Discount</label>
            <Input type="number" placeholder="0" className="rounded-lg border-[#E2E8F0] mt-1" value={form.payment.discount} onChange={(e) => setForm({ ...form, payment: { ...form.payment, discount: Number(e.target.value) } })} />
          </div>
          <div className="col-span-2 sm:col-span-2">
            <label className="text-xs text-[#475569]">Total</label>
            <div className="h-10 mt-1 rounded-lg border border-[#E2E8F0] bg-[#F0FDF4] px-3 flex items-center justify-between">
              <span className="text-xs text-[#475569]">₹</span>
              <span className="text-lg font-bold text-emerald-700">{Math.max(0, (form.payment.amount || 0) - (form.payment.discount || 0))}</span>
            </div>
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label className="text-xs text-[#475569]">Method</label>
            <select className="flex h-10 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.payment.paymentMethod} onChange={(e) => setForm({ ...form, payment: { ...form.payment, paymentMethod: e.target.value } })}>
              <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option><option value="ONLINE">Online</option>
            </select>
          </div>
          <div className="col-span-1 sm:col-span-3">
            <label className="text-xs text-[#475569]">Status</label>
            <select className="flex h-10 w-full min-w-0 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] mt-1" value={form.payment.paymentStatus} onChange={(e) => setForm({ ...form, payment: { ...form.payment, paymentStatus: e.target.value } })}>
              <option value="PAID">Paid</option><option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>
      <Button type="submit" disabled={loading || !form.patientId || !form.doctorId} className="w-full rounded-lg">
        {loading ? 'Creating...' : 'Create Visit & Token'}
      </Button>
    </form>
  );
}
