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
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Search, Eye } from 'lucide-react';
import type { Payment } from '@/types';
import Link from 'next/link';

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search, page],
    queryFn: async () => {
      const res = await api.get('/payments', { params: { search, page, limit: 15 } });
      return res.data;
    },
  });

  const todayCollection = useQuery({
    queryKey: ['payments-today'],
    queryFn: async () => { const res = await api.get('/payments/today'); return res.data.data; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Payments</h2>
        <p className="text-sm text-[#475569]">Track collections and payment records</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#475569]">Today&apos;s Collection</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(todayCollection.data?.total || 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#475569]">Transactions Today</p>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">{todayCollection.data?.count || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#475569]">Payment Methods</p>
            <p className="text-2xl font-bold text-primary mt-1">{Object.keys(todayCollection.data?.byMethod || {}).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search receipts..." className="pl-9 h-10 rounded-lg border-[#E2E8F0]" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Receipt No.</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden sm:table-cell">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Discount</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Net Amount</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden sm:table-cell">Method</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#475569] uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array(5).fill(null).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={9}><Skeleton className="h-10 w-full rounded" /></TableCell></TableRow>
              )) : data?.data?.map((payment: Payment) => (
                <TableRow key={payment.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <TableCell className="font-mono text-xs text-[#0F172A] hidden md:table-cell">{payment.receiptNumber}</TableCell>
                  <TableCell className="text-[#0F172A]">{payment.patient?.firstName} {payment.patient?.lastName}</TableCell>
                  <TableCell className="text-[#475569] hidden sm:table-cell">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-[#475569] hidden md:table-cell">{formatCurrency(payment.discount)}</TableCell>
                  <TableCell className="font-medium text-[#0F172A]">{formatCurrency(payment.netAmount)}</TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs border-[#E2E8F0] text-[#475569]">{payment.paymentMethod}</Badge></TableCell>
                  <TableCell><Badge className={`${getStatusColor(payment.paymentStatus)} text-xs`}>{payment.paymentStatus}</Badge></TableCell>
                  <TableCell className="text-xs text-[#475569] hidden md:table-cell">{formatDate(payment.createdAt, 'time')}</TableCell>
                  <TableCell>
                    <Link href={`/patients/${payment.patientId}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary group">
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
          <span>Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border-[#E2E8F0]">Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border-[#E2E8F0]">Next</Button>
          </div>
        </div>
      )}

    </div>
  );
}
