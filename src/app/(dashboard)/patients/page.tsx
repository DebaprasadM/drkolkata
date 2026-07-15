'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Phone, Eye, Calendar, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Patient, PaginatedResponse } from '@/types';
import Link from 'next/link';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, dateFrom, dateTo, page],
    queryFn: async () => {
      const params: Record<string, any> = { search, page, limit: 10 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await api.get('/patients', { params });
      return res.data as PaginatedResponse<Patient>;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Patients</h2>
        <p className="text-sm text-[#475569]">Manage patient records and history</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, ID..." className="pl-9 h-10 rounded-lg border-[#E2E8F0]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40 pl-9 h-10 rounded-lg border-[#E2E8F0]" />
            </div>
            <span className="text-[#475569] text-sm">to</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40 pl-9 h-10 rounded-lg border-[#E2E8F0]" />
            </div>
            {(dateFrom || dateTo) && (
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}>
                <X className="h-4 w-4 text-[#475569]" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Patient ID</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden sm:table-cell">Gender/Age</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Phone</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Blood Group</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Visits</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Registered</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array(5).fill(null).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={8}><Skeleton className="h-10 w-full rounded" /></TableCell></TableRow>
              )) : data?.data?.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <TableCell className="font-mono text-xs font-medium text-[#0F172A] hidden md:table-cell">{patient.patientId}</TableCell>
                  <TableCell className="font-medium text-[#0F172A]">{patient.firstName} {patient.lastName}</TableCell>
                  <TableCell className="text-[#475569] hidden sm:table-cell">{patient.gender} / {patient.age || 'N/A'}</TableCell>
                  <TableCell><span className="flex items-center gap-1.5 text-[#475569]"><Phone className="h-3 w-3" />{patient.phone}</span></TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs border-[#E2E8F0] text-[#475569]">{patient.bloodGroup || 'N/A'}</Badge></TableCell>
                  <TableCell className="text-[#475569]">{patient._count?.visits || 0}</TableCell>
                  <TableCell className="text-[#475569] hidden md:table-cell">{formatDate(patient.createdAt)}</TableCell>
                  <TableCell>
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary group">
                        <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </Button>
                    </Link>
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
          <span>Showing {((data.meta.page - 1) * data.meta.limit) + 1} to {Math.min(data.meta.page * data.meta.limit, data.meta.total)} of {data.meta.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border-[#E2E8F0]">Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border-[#E2E8F0]">Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

