'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Eye, Share2 } from 'lucide-react';
import type { Prescription } from '@/types';
import Link from 'next/link';

export default function PrescriptionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', search, page],
    queryFn: async () => {
      const res = await api.get('/prescriptions', { params: { search, page, limit: 15 } });
      return res.data;
    },
  });

  const handleShareWhatsApp = (rx: Prescription) => {
    const phone = rx.patient?.whatsappNumber || rx.patient?.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const shareUrl = `${window.location.origin}/prescriptions/${rx.prescriptionNo}`;
    const message = encodeURIComponent(
      `Hi ${rx.patient?.firstName},\n\nYour prescription from the clinic is ready.\n\nPrescription No: ${rx.prescriptionNo}\nDoctor: Dr. ${rx.doctor?.user?.firstName} ${rx.doctor?.user?.lastName}\n\nView your prescription:\n${shareUrl}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Prescriptions</h2>
        <p className="text-sm text-[#475569]">View and manage prescriptions</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search prescriptions..." className="pl-9 h-10 rounded-lg border-[#E2E8F0]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Link href="/prescriptions/compose">
          <Button className="rounded-lg"><Plus className="mr-2 h-4 w-4" /> Write Prescription</Button>
        </Link>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Prescription No.</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden sm:table-cell">Doctor</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Medicines</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array(5).fill(null).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full rounded" /></TableCell></TableRow>
              )) : data?.data?.map((rx: Prescription) => (
                <TableRow key={rx.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <TableCell className="font-mono text-xs text-[#0F172A] hidden md:table-cell">{rx.prescriptionNo}</TableCell>
                  <TableCell className="text-[#0F172A]">{rx.patient?.firstName} {rx.patient?.lastName}</TableCell>
                  <TableCell className="text-[#475569] hidden sm:table-cell">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</TableCell>
                  <TableCell className="text-[#475569]">{rx.medicines?.length || 0} items</TableCell>
                  <TableCell className="text-[#475569] hidden md:table-cell">{formatDate(rx.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/prescriptions/${rx.prescriptionNo}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary" title="View Prescription">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600" title="Share via WhatsApp" onClick={() => handleShareWhatsApp(rx)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {data?.meta && (
        <div className="flex items-center justify-between text-sm text-[#475569]">
          <span>Page {data.meta.page} of {data.meta.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border-[#E2E8F0]">Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border-[#E2E8F0]">Next</Button>
          </div>
        </div>
      )}

    </div>
  );
}
