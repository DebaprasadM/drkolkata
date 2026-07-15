'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7');

  const revenueReport = useQuery({
    queryKey: ['report-revenue', dateRange],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - Number(dateRange) * 86400000).toISOString().split('T')[0];
      const res = await api.get('/reports/revenue', { params: { startDate, endDate } });
      return res.data.data;
    },
  });

  const doctorRevenue = useQuery({
    queryKey: ['report-doctor-revenue', dateRange],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - Number(dateRange) * 86400000).toISOString().split('T')[0];
      const res = await api.get('/reports/doctor-revenue', { params: { startDate, endDate } });
      return res.data.data;
    },
  });

  const visitReport = useQuery({
    queryKey: ['report-visits', dateRange],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - Number(dateRange) * 86400000).toISOString().split('T')[0];
      const res = await api.get('/reports/visits', { params: { startDate, endDate } });
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Reports</h2>
          <p className="text-sm text-[#475569]">Analytics and business insights</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <Button key={days} variant={dateRange === String(days) ? 'default' : 'outline'} size="sm" onClick={() => setDateRange(String(days))} className={`rounded-lg ${dateRange === String(days) ? '' : 'border-[#E2E8F0]'}`}>
              Last {days}d
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="rounded-lg">
          <TabsTrigger value="revenue" className="rounded-md">Revenue</TabsTrigger>
          <TabsTrigger value="doctors" className="rounded-md">Doctor-wise</TabsTrigger>
          <TabsTrigger value="visits" className="rounded-md">Visits</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardContent className="p-5"><p className="text-2xl font-bold text-[#0F172A]">{formatCurrency(revenueReport.data?.totalRevenue || 0)}</p><p className="text-xs font-medium text-[#475569] mt-1">Total Revenue</p></CardContent>
            </Card>
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardContent className="p-5"><p className="text-2xl font-bold text-[#0F172A]">{revenueReport.data?.count || 0}</p><p className="text-xs font-medium text-[#475569] mt-1">Transactions</p></CardContent>
            </Card>
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardContent className="p-5"><p className="text-2xl font-bold text-[#0F172A]">{Object.keys(revenueReport.data?.byMethod || {}).length}</p><p className="text-xs font-medium text-[#475569] mt-1">Payment Methods</p></CardContent>
            </Card>
          </div>

          <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-[#0F172A]">Revenue by Payment Method</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(revenueReport.data?.byMethod || {}).map(([k, v]) => ({ name: k, value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name }) => name}>
                      {Object.entries(revenueReport.data?.byMethod || {}).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {revenueReport.data?.payments?.slice(0, 10).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3 text-sm">
                <span className="text-[#0F172A]">{p.receiptNumber} - {p.patient?.firstName} {p.patient?.lastName}</span>
                <span className="font-medium text-[#0F172A]">{formatCurrency(p.netAmount)}</span>
                <Badge variant="outline" className="text-xs border-[#E2E8F0] text-[#475569]">{p.paymentMethod}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4 mt-6">
          <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-[#E2E8F0]">
                {doctorRevenue.data?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors">
                    <span className="font-medium text-[#0F172A]">{doc.name}</span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-[#475569]">{doc.count} consultations</span>
                      <span className="font-bold text-[#0F172A]">{formatCurrency(doc.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardContent className="p-5"><p className="text-2xl font-bold text-[#0F172A]">{visitReport.data?.total || 0}</p><p className="text-xs font-medium text-[#475569] mt-1">Total Visits</p></CardContent>
            </Card>
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardContent className="p-5"><p className="text-2xl font-bold text-[#0F172A]">{Object.keys(visitReport.data?.byStatus || {}).length}</p><p className="text-xs font-medium text-[#475569] mt-1">Status Types</p></CardContent>
            </Card>
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardContent className="p-5"><p className="text-2xl font-bold text-[#0F172A]">{Object.keys(visitReport.data?.byType || {}).length}</p><p className="text-xs font-medium text-[#475569] mt-1">Consultation Types</p></CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-[#0F172A]">By Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(visitReport.data?.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-[#475569]">{status}</span>
                      <Badge className="text-xs bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">{String(count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-[#0F172A]">By Type</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(visitReport.data?.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="text-[#475569]">{type}</span>
                      <Badge className="text-xs bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">{String(count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
