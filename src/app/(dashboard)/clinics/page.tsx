'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Building2, Users, UserCheck, Activity, LogIn } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Clinic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; patients: number; doctors: number };
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default function ClinicsPage() {
  const queryClient = useQueryClient();
  const { switchClinic } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['clinics', search, page],
    queryFn: async () => {
      const res = await api.get('/clinics', { params: { search, page, limit: 10 } });
      return res.data as PaginatedResponse<Clinic>;
    },
  });

  const handleCreate = async () => {
    if (!form.name) return;
    setCreating(true);
    try {
      await api.post('/clinics', form);
      setDialogOpen(false);
      setForm({ name: '', email: '', phone: '', address: '' });
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create clinic', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Clinics</h2>
        <p className="text-sm text-[#475569]">Manage all registered clinics</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input placeholder="Search clinics..." className="pl-9 h-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 gap-2"><Plus className="h-4 w-4" /> Add Clinic</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>New Clinic</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#475569]">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Clinic name" />
              </div>
              <div>
                <label className="text-xs text-[#475569]">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@clinic.com" />
              </div>
              <div>
                <label className="text-xs text-[#475569]">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91-..." />
              </div>
              <div>
                <label className="text-xs text-[#475569]">Address</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Clinic'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] border-[#E2E8F0]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="text-center">Doctors</TableHead>
                <TableHead className="text-center">Patients</TableHead>
                <TableHead className="text-center hidden md:table-cell">Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-[#475569]">No clinics found</TableCell></TableRow>
              ) : (
                data?.data.map((clinic) => (
                    <TableRow key={clinic.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0F172A]">{clinic.name}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={async () => {
                        await switchClinic(clinic.id);
                        queryClient.clear();
                        router.push('/dashboard');
                      }}>
                        <LogIn className="h-3.5 w-3.5" /> Enter
                      </Button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-[#475569]">{clinic.email || '—'}</p>
                      <p className="text-xs text-[#94A3B8]">{clinic.phone || '—'}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <UserCheck className="h-4 w-4 text-[#94A3B8]" />
                        <span>{clinic._count.doctors}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-[#94A3B8]" />
                        <span>{clinic._count.patients}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="h-4 w-4 text-[#94A3B8]" />
                        <span>{clinic._count.users}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={clinic.isActive ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}>
                        {clinic.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-[#475569] text-sm">{formatDate(clinic.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-[#475569]">Page {page} of {data.meta.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
