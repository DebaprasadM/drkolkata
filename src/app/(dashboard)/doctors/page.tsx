'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Shield, ShieldOff, Trash2, Stethoscope, Pencil, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Doctor } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DoctorsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', search],
    queryFn: async () => {
      const res = await api.get('/doctors', { params: { search, limit: 50 } });
      return res.data.data as Doctor[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/doctors/${id}/toggle-active`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast({ title: 'Success', description: 'Doctor status updated', variant: 'success' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  const deleteDoctor = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/doctors/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast({ title: 'Success', description: 'Doctor deleted', variant: 'success' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Doctors</h2>
        <p className="text-sm text-[#475569]">Manage doctors and their availability</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search doctors..." className="pl-9 h-10 rounded-lg border-[#E2E8F0]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isSuperAdmin && (
          <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setCreatedPassword(null); }}>
            <DialogTrigger asChild><Button className="rounded-lg"><Plus className="mr-2 h-4 w-4" /> Add Doctor</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
            {createdPassword ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm font-medium text-green-800">Doctor created successfully!</p>
                  <p className="text-sm text-green-700 mt-1">Default password: <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-sm">{createdPassword}</code></p>
                  <button
                    className="mt-2 text-xs text-green-600 flex items-center gap-1 hover:underline"
                    onClick={() => { navigator.clipboard.writeText(createdPassword); toast({ title: 'Copied', variant: 'success' }); }}
                  >
                    <Copy className="h-3 w-3" /> Copy password
                  </button>
                </div>
                <p className="text-xs text-[#64748B]">Share these credentials with the doctor. They should change password on first login.</p>
                <Button className="w-full rounded-lg" onClick={() => { setAddDialogOpen(false); setCreatedPassword(null); }}>Done</Button>
              </div>
            ) : (
              <DoctorForm onSuccess={(password) => { queryClient.invalidateQueries({ queryKey: ['doctors'] }); if (password) setCreatedPassword(password); else setAddDialogOpen(false); }} />
            )}
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((doctor) => (
          <Card key={doctor.id} className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-start gap-4 p-5">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                    {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#0F172A] truncate">Dr. {doctor.user.firstName} {doctor.user.lastName}</h3>
                    <Badge variant={doctor.user.isActive ? 'success' : 'secondary'} className="text-xs">{doctor.user.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-sm text-[#475569]">{doctor.specialization || 'General'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#475569]">
                    <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" /> {doctor.qualification || 'N/A'}</span>
                    <span className="bg-[#F8FAFC] px-2 py-0.5 rounded-md">Fee: {formatCurrency(doctor.consultationFee)}</span>
                    <Badge variant={doctor.isAvailable ? 'success' : 'secondary'} className="text-xs">{doctor.isAvailable ? 'Available' : 'Unavailable'}</Badge>
                    {doctor.isClinicAdmin && <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">Admin</Badge>}
                  </div>
                </div>
              </div>
              <div className="flex border-t border-[#E2E8F0]">
                <Button variant="ghost" size="sm" className="flex-1 rounded-none h-10 text-[#475569] hover:text-[#0F172A]" onClick={() => setEditDoctor(doctor)}>
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit
                </Button>
                <div className="w-px bg-[#E2E8F0]" />
                <Button variant="ghost" size="sm" className="flex-1 rounded-none h-10 text-[#475569] hover:text-[#0F172A]" onClick={() => toggleActive.mutate(doctor.id)}>
                  {doctor.user.isActive ? <ShieldOff className="h-4 w-4 mr-1.5" /> : <Shield className="h-4 w-4 mr-1.5" />}
                  {doctor.user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                {isSuperAdmin && (
                  <>
                    <div className="w-px bg-[#E2E8F0]" />
                    <Button variant="ghost" size="sm" className="flex-1 rounded-none h-10 text-[#475569] hover:text-red-600" onClick={() => { if (confirm('Delete this doctor?')) deleteDoctor.mutate(doctor.id); }}>
                      <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editDoctor} onOpenChange={(open) => { if (!open) setEditDoctor(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Doctor</DialogTitle></DialogHeader>
          {editDoctor && (
            <DoctorForm
              doctor={editDoctor}
              onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['doctors'] }); setEditDoctor(null); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DoctorForm({ doctor, onSuccess }: { doctor?: Doctor; onSuccess: (password?: string) => void }) {
  const [form, setForm] = useState({
    email: doctor?.user?.email || '',
    firstName: doctor?.user?.firstName || '',
    lastName: doctor?.user?.lastName || '',
    phone: doctor?.user?.phone || '',
    specialization: doctor?.specialization || '',
    qualification: doctor?.qualification || '',
    registrationNo: doctor?.registrationNo || '',
    consultationFee: doctor?.consultationFee || 0,
    bio: doctor?.bio || '',
    isAvailable: doctor?.isAvailable ?? true,
    isClinicAdmin: doctor?.isClinicAdmin ?? false,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const isEdit = !!doctor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/doctors/${doctor.id}`, form);
        toast({ title: 'Success', description: 'Doctor updated', variant: 'success' });
        onSuccess();
      } else {
        const res = await api.post('/doctors', form);
        toast({ title: 'Success', description: 'Doctor created', variant: 'success' });
        onSuccess(res.data.data.defaultPassword);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <>
          <div>
            <label className="text-xs font-medium text-[#475569] mb-1 block">Email *</label>
            <Input placeholder="doctor@example.com" className="rounded-lg border-[#E2E8F0]" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-medium text-[#475569] mb-1 block">Password *</label>
            <Input type="password" placeholder="Set login password" className="rounded-lg border-[#E2E8F0]" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <p className="text-[11px] text-[#94A3B8] mt-1">Doctor will use this to login. They can change it later.</p>
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[#475569] mb-1 block">First Name *</label>
          <Input placeholder="First Name" className="rounded-lg border-[#E2E8F0]" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        </div>
        <div>
          <label className="text-xs font-medium text-[#475569] mb-1 block">Last Name *</label>
          <Input placeholder="Last Name" className="rounded-lg border-[#E2E8F0]" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Phone</label>
        <Input placeholder="Phone Number" className="rounded-lg border-[#E2E8F0]" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[#475569] mb-1 block">Specialization</label>
          <Input placeholder="e.g. Cardiology" className="rounded-lg border-[#E2E8F0]" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium text-[#475569] mb-1 block">Qualification</label>
          <Input placeholder="e.g. MBBS, MD" className="rounded-lg border-[#E2E8F0]" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Registration No.</label>
        <Input placeholder="Medical registration number" className="rounded-lg border-[#E2E8F0]" value={form.registrationNo} onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Consultation Fee</label>
        <Input type="number" placeholder="0" className="rounded-lg border-[#E2E8F0]" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Bio</label>
        <Input placeholder="Short description about the doctor" className="rounded-lg border-[#E2E8F0]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>

      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
          <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="rounded border-[#E2E8F0]" />
          Available
        </label>
        <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
          <input type="checkbox" checked={form.isClinicAdmin} onChange={(e) => setForm({ ...form, isClinicAdmin: e.target.checked })} className="rounded border-[#E2E8F0]" />
          Clinic Admin
        </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full rounded-lg">{loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Doctor' : 'Create Doctor')}</Button>
    </form>
  );
}
