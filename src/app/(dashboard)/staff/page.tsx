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
import { Plus, Search, Shield, ShieldOff, Trash2, UserCog, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function StaffPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const clinicId = user?.clinicId;
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery<StaffMember[]>({
    queryKey: ['staff', clinicId],
    queryFn: async () => {
      const res = await api.get(`/clinics/${clinicId}/staff`);
      return res.data.data;
    },
    enabled: !!clinicId,
  });

  const toggleActive = useMutation({
    mutationFn: async (userId: string) => {
      await api.patch(`/clinics/${clinicId}/staff/${userId}/toggle-active`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Success', description: 'Staff status updated', variant: 'success' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  const deleteStaff = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/clinics/${clinicId}/staff/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast({ title: 'Success', description: 'Staff deleted', variant: 'success' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  const filtered = (staff || []).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Staff</h2>
        <p className="text-sm text-[#475569]">Manage clinic staff and receptionists</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search staff..." className="pl-9 h-10 rounded-lg border-[#E2E8F0]" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isSuperAdmin && (
          <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setCreatedPassword(null); }}>
            <DialogTrigger asChild>
              <Button className="rounded-lg"><Plus className="mr-2 h-4 w-4" /> Add Staff</Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
            {createdPassword ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm font-medium text-green-800">Staff created successfully!</p>
                  <p className="text-sm text-green-700 mt-1">Default password: <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-sm">{createdPassword}</code></p>
                  <button
                    className="mt-2 text-xs text-green-600 flex items-center gap-1 hover:underline"
                    onClick={() => { navigator.clipboard.writeText(createdPassword); toast({ title: 'Copied', variant: 'success' }); }}
                  >
                    <Copy className="h-3 w-3" /> Copy password
                  </button>
                </div>
                <p className="text-xs text-[#64748B]">Share this password with the staff member. They should change it on first login.</p>
                <Button className="w-full rounded-lg" onClick={() => { setAddDialogOpen(false); setCreatedPassword(null); }}>Done</Button>
              </div>
            ) : (
              <StaffForm clinicId={clinicId!} onSuccess={(password) => { queryClient.invalidateQueries({ queryKey: ['staff'] }); setCreatedPassword(password); }} />
            )}
          </DialogContent>
        </Dialog>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="py-12 text-center">
            <UserCog className="h-12 w-12 text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#475569] font-medium">No staff members yet</p>
            <p className="text-sm text-[#94A3B8] mt-1">Add receptionists and admin staff to your clinic</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <Card key={member.id} className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-5">
                  <Avatar className="h-12 w-12 rounded-xl">
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#0F172A] truncate">{member.firstName} {member.lastName}</h3>
                      <Badge variant={member.isActive ? 'success' : 'secondary'} className="text-xs">{member.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-sm text-[#475569]">{member.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className={`text-xs ${member.role === 'CLINIC_ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {member.role === 'CLINIC_ADMIN' ? 'Admin' : 'Receptionist'}
                      </Badge>
                      {member.phone && <span className="text-xs text-[#94A3B8]">{member.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex border-t border-[#E2E8F0]">
                  <Button variant="ghost" size="sm" className="flex-1 rounded-none h-10 text-[#475569] hover:text-[#0F172A]" onClick={() => toggleActive.mutate(member.id)}>
                    {member.isActive ? <ShieldOff className="h-4 w-4 mr-1.5" /> : <Shield className="h-4 w-4 mr-1.5" />}
                    {member.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  {isSuperAdmin && (
                    <>
                      <div className="w-px bg-[#E2E8F0]" />
                      <Button variant="ghost" size="sm" className="flex-1 rounded-none h-10 text-[#475569] hover:text-red-600" onClick={() => { if (confirm('Delete this staff member?')) deleteStaff.mutate(member.id); }}>
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StaffForm({ clinicId, onSuccess }: { clinicId: string; onSuccess: (password: string) => void }) {
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', phone: '', role: 'RECEPTIONIST', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/clinics/${clinicId}/staff`, form);
      onSuccess(res.data.data.defaultPassword);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label className="text-xs font-medium text-[#475569] mb-1 block">Email *</label>
        <Input type="email" placeholder="staff@clinic.com" className="rounded-lg border-[#E2E8F0]" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Password *</label>
        <Input type="password" placeholder="Set login password" className="rounded-lg border-[#E2E8F0]" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <p className="text-[11px] text-[#94A3B8] mt-1">Staff will use this to login. They can change it later.</p>
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Phone</label>
        <Input placeholder="Phone Number" className="rounded-lg border-[#E2E8F0]" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#475569] mb-1 block">Role</label>
        <select
          className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-blue-500"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="CLINIC_ADMIN">Clinic Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={loading} className="w-full rounded-lg">{loading ? 'Creating...' : 'Create Staff'}</Button>
    </form>
  );
}
