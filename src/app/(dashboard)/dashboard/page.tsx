'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  CalendarCheck, DollarSign, Clock, CheckCircle2, Stethoscope, Users, Activity,
  Building2, UserPlus, FilePlus, ListOrdered, BarChart3, ChevronRight, Rocket,
  TrendingUp, TrendingDown, ArrowRight, User, CreditCard,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import type { DashboardStats, SuperAdminStats } from '@/types';

const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const PAYMENT_METHOD_LABELS: Record<string, string> = { CASH: 'Cash', UPI: 'UPI', CARD: 'Card', ONLINE: 'Online', DUE: 'Due' };
const PAYMENT_METHOD_COLORS: Record<string, string> = { CASH: '#10B981', UPI: '#2563EB', CARD: '#8B5CF6', ONLINE: '#F59E0B', DUE: '#EF4444' };

function useCountUp(end: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (end === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [end, duration]);
  return value;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AnimatedStatCard({ title, value, icon: Icon, color, bg, trend, isCurrency, onClick }: {
  title: string; value: number; icon: any; color: string; bg: string; trend?: number; isCurrency?: boolean; onClick?: () => void;
}) {
  const displayVal = useCountUp(isCurrency ? value : value, 1000);
  return (
    <div className="stat-card cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-[#0F172A]">
            {isCurrency ? formatCurrency(displayVal) : displayVal}
          </p>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend > 0 ? '+' : ''}{trend}% vs yesterday
            </div>
          )}
        </div>
        <div className={`icon-wrapper ${bg} group-hover:scale-110 transition-transform`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function PatientFlowFunnel({ flow }: { flow: DashboardStats['patientFlow'] }) {
  const steps = [
    { label: 'Registered', value: flow.registered, color: '#2563EB', icon: Users },
    { label: 'Waiting', value: flow.waiting, color: '#F59E0B', icon: Clock },
    { label: 'In Consultation', value: flow.inConsultation, color: '#8B5CF6', icon: Stethoscope },
    { label: 'Completed', value: flow.completed, color: '#10B981', icon: CheckCircle2 },
  ];
  const max = Math.max(flow.registered, 1);
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-32 shrink-0">
            <step.icon className="h-4 w-4" style={{ color: step.color }} />
            <span className="text-xs font-medium text-[#475569]">{step.label}</span>
          </div>
          <div className="flex-1 relative h-8 rounded-lg bg-[#F1F5F9] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
              style={{ width: `${(step.value / max) * 100}%`, backgroundColor: step.color, minWidth: step.value > 0 ? '2rem' : 0 }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#0F172A] z-10">{step.value}</span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="h-3 w-3 text-[#CBD5E1] shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({ activities }: { activities: DashboardStats['recentActivities'] }) {
  if (!activities.length) return <div className="flex h-32 items-center justify-center text-sm text-[#94A3B8]">No activity yet today</div>;
  return (
    <div className="space-y-1 max-h-80 overflow-y-auto">
      {activities.map((a, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-[#F8FAFC] transition-colors">
          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${a.type === 'payment' ? 'bg-emerald-50' : 'bg-primary/10'}`}>
            {a.type === 'payment' ? <CreditCard className="h-3.5 w-3.5 text-emerald-600" /> : <User className="h-3.5 w-3.5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#0F172A] leading-relaxed truncate">{a.label}</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">{formatTimeAgo(a.time)}</p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0 border-[#E2E8F0]">
            {a.status.replace('_', ' ')}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function PaymentBreakdownChart({ data }: { data: DashboardStats['paymentBreakdown'] }) {
  if (!data.length) return <div className="flex h-48 items-center justify-center text-sm text-[#94A3B8]">No payments today</div>;
  const total = data.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="flex items-center gap-4">
      <div className="w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3}>
              {data.map((d, i) => <Cell key={i} fill={PAYMENT_METHOD_COLORS[d.method] || PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((d) => (
          <div key={d.method} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PAYMENT_METHOD_COLORS[d.method] || '#94A3B8' }} />
              <span className="text-xs text-[#475569]">{PAYMENT_METHOD_LABELS[d.method] || d.method}</span>
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">{formatCurrency(d.amount)}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs font-medium text-[#475569]">Total</span>
          <span className="text-sm font-bold text-[#0F172A]">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

function TopDiagnosesChart({ data }: { data: DashboardStats['topDiagnoses'] }) {
  if (!data.length) return <div className="flex h-48 items-center justify-center text-sm text-[#94A3B8]">No diagnoses recorded today</div>;
  return (
    <div className="flex items-center gap-4">
      <div className="w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="diagnosis" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={d.diagnosis} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-xs text-[#475569] truncate">{d.diagnosis}</span>
            </div>
            <span className="text-xs font-semibold text-[#0F172A] shrink-0 ml-2">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' && !user?.clinicId;

  const { data, isLoading } = useQuery<DashboardStats | SuperAdminStats>({
    queryKey: ['dashboard', user?.clinicId],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
  });

  const { data: queueData } = useQuery({
    queryKey: ['queue-stats', user?.clinicId],
    queryFn: async () => {
      const res = await api.get('/queue/stats');
      return res.data.data;
    },
    enabled: !isSuperAdmin,
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isSuperAdmin) {
    const sa = data as SuperAdminStats | undefined;
    const s = sa?.stats;
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Super Admin Dashboard</h2>
          <p className="text-sm text-[#475569]">System-wide overview across all clinics</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="stat-card cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push('/clinics')}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Clinics</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">{s?.totalClinics || 0}</p>
              </div>
              <div className="icon-wrapper bg-primary/10"><Building2 className="h-6 w-6 text-primary" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Clinics</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">{s?.activeClinics || 0}</p>
              </div>
              <div className="icon-wrapper bg-emerald-50"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">{s?.totalPatients || 0}</p>
              </div>
              <div className="icon-wrapper bg-violet-50"><Users className="h-6 w-6 text-violet-600" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Doctors</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">{s?.totalDoctors || 0}</p>
              </div>
              <div className="icon-wrapper bg-sky-50"><Stethoscope className="h-6 w-6 text-sky-600" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">{s?.totalUsers || 0}</p>
              </div>
              <div className="icon-wrapper bg-amber-50"><Activity className="h-6 w-6 text-amber-600" /></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold tracking-tight text-[#0F172A]">{formatCurrency(s?.totalRevenue || 0)}</p>
              </div>
              <div className="icon-wrapper bg-emerald-50"><DollarSign className="h-6 w-6 text-emerald-600" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = (data as DashboardStats)?.stats;
  const charts = (data as DashboardStats)?.charts;
  const patientFlow = (data as DashboardStats)?.patientFlow;
  const recentActivities = (data as DashboardStats)?.recentActivities || [];
  const paymentBreakdown = (data as DashboardStats)?.paymentBreakdown || [];
  const topDiagnoses = (data as DashboardStats)?.topDiagnoses || [];

  const statCards = [
    { title: "Today's Patients", value: stats?.todayPatients || 0, icon: CalendarCheck, color: 'text-primary', bg: 'bg-primary/10', href: '/visits', trend: stats?.patTrend },
    { title: "Today's Revenue", value: stats?.todayRevenue || 0, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/payments', isCurrency: true, trend: stats?.revTrend },
    { title: 'Waiting', value: stats?.waitingPatients || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/visits' },
    { title: 'In Consultation', value: stats?.inConsultation || 0, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', href: '/visits' },
    { title: 'Completed', value: stats?.completedConsultations || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/visits' },
    { title: 'Doctors Available', value: stats?.availableDoctors || 0, icon: Stethoscope, color: 'text-sky-600', bg: 'bg-sky-50', href: '/doctors' },
    { title: 'Monthly Revenue', value: stats?.monthlyRevenue || 0, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10', href: '/payments', isCurrency: true },
  ];

  const quickActions = [
    { label: 'Register Patient', icon: UserPlus, href: '/patients', variant: 'default' as const },
    { label: 'Existing Patient Visit', icon: FilePlus, href: '/visits', variant: 'outline' as const },
    { label: 'View Queue', icon: ListOrdered, href: '/visits', variant: 'outline' as const },
    { label: 'Reports', icon: BarChart3, href: '/reports', variant: 'outline' as const },
  ];

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">{getGreeting()}, {user?.firstName} 👋</h2>
          <p className="text-sm text-[#475569]">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.totalDoctors === 0 && stats.totalPatients === 0 && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">New Clinic</Badge>
          )}
        </div>
      </div>

      {/* Setup Wizard */}
      {stats && stats.totalDoctors === 0 && stats.totalPatients === 0 && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 shrink-0">
                <Rocket className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#0F172A]">Welcome! Let&apos;s set up your clinic</h3>
                <p className="text-sm text-[#475569] mt-1">Complete these steps to get your clinic running.</p>
                <div className="mt-4 space-y-3">
                  {[
                    { step: 1, label: 'Clinic created', done: true },
                    { step: 2, label: 'Add your first doctor', done: false, href: '/doctors', hint: 'Doctors are needed to start consultations' },
                    { step: 3, label: 'Add staff members', done: false, href: '/staff', hint: 'Receptionists to manage patient flow' },
                    { step: 4, label: 'Configure clinic settings', done: false, href: '/settings', hint: 'WhatsApp, prescription template, etc.' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${item.done ? 'bg-green-100 text-green-700' : 'bg-white text-[#94A3B8] border border-[#E2E8F0]'}`}>
                        {item.done ? <CheckCircle2 className="h-4 w-4" /> : item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.done ? 'text-green-700' : 'text-[#0F172A]'}`}>{item.label}</p>
                        {item.hint && <p className="text-xs text-[#94A3B8]">{item.hint}</p>}
                      </div>
                      {!item.done && item.href && (
                        <Button size="sm" variant="outline" className="rounded-lg text-xs shrink-0" onClick={() => router.push(item.href)}>
                          Go <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animated Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map((card) => (
          <AnimatedStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bg={card.bg}
            trend={card.trend}
            isCurrency={card.isCurrency}
            onClick={() => router.push(card.href)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-[#0F172A]">Quick Actions</span>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button key={action.label} variant={action.variant} size="sm" className="gap-2" onClick={() => router.push(action.href)}>
                  <action.icon className="h-4 w-4" /> {action.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Flow + Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Patient Flow Today</CardTitle>
          </CardHeader>
          <CardContent>
            {patientFlow ? <PatientFlowFunnel flow={patientFlow} /> : <Skeleton className="h-40 w-full rounded-lg" />}
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed activities={recentActivities} />
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown + Top Diagnoses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Payment Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentBreakdownChart data={paymentBreakdown} />
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Top Diagnoses Today</CardTitle>
          </CardHeader>
          <CardContent>
            <TopDiagnosesChart data={topDiagnoses} />
          </CardContent>
        </Card>
      </div>

      {/* Revenue + Patient Trend Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Daily Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {charts?.dailyRevenue?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0]" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#94A3B8]">No revenue data for last 7 days</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Patient Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {charts?.dailyRevenue?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-[#E2E8F0]" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis className="text-xs" tick={{ fill: '#475569', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Line type="monotone" dataKey="patients" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#94A3B8]">No patient data for last 7 days</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue + Doctor Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Today&apos;s Queue Status</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => router.push('/visits')}>
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Waiting', value: queueData?.waiting || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Called', value: queueData?.called || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'In Consultation', value: queueData?.inConsultation || 0, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Completed', value: queueData?.completed || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Total', value: queueData?.total || 0, color: 'text-[#0F172A]', bg: 'bg-slate-100' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center justify-center rounded-xl border border-[#E2E8F0] p-4">
                  <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
                  <span className="text-xs text-[#475569] mt-1 text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">Doctor Today Status</CardTitle>
          </CardHeader>
          <CardContent>
            {charts?.doctorStats?.length ? (
              <div className="grid gap-2">
                {charts.doctorStats.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {doc.name.replace(/^Dr\.\s*/, '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#0F172A]">{doc.name}</p>
                        <p className="text-xs text-[#475569]">{doc.specialization || 'General'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={doc.isAvailable ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#DC2626]/10 text-[#DC2626]'}>
                        {doc.isAvailable ? 'Available' : 'Busy'}
                      </Badge>
                      <span className="text-sm font-bold text-[#0F172A]">{doc.todayPatients}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-[#94A3B8]">No doctors found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-5 w-48 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array(7).fill(null).map((_, i) => (
          <Card key={i} className="border-[#E2E8F0]"><CardContent className="p-6"><Skeleton className="h-16 w-full rounded-lg" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array(2).fill(null).map((_, i) => (
          <Card key={i} className="border-[#E2E8F0]"><CardContent className="p-6"><Skeleton className="h-40 w-full rounded-lg" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array(2).fill(null).map((_, i) => (
          <Card key={i} className="border-[#E2E8F0]"><CardContent className="p-6"><Skeleton className="h-48 w-full rounded-lg" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array(2).fill(null).map((_, i) => (
          <Card key={i} className="border-[#E2E8F0]"><CardContent className="p-6"><Skeleton className="h-72 w-full rounded-lg" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
