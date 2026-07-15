'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { switchClinic } from '@/lib/auth';
import {
  LayoutDashboard, Users, Stethoscope, CalendarCheck, ShoppingCart,
  FileText, BarChart3, Settings, ChevronLeft, Building2, LogOut, UserCog,
} from 'lucide-react';

const superAdminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clinics', label: 'Clinics', icon: Building2 },
];

const clinicNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['CLINIC_ADMIN'] },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['CLINIC_ADMIN'] },
  { href: '/staff', label: 'Staff', icon: UserCog, roles: ['CLINIC_ADMIN'] },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/visits', label: 'OPD Visits', icon: CalendarCheck },
  { href: '/payments', label: 'Payments', icon: ShoppingCart, roles: ['CLINIC_ADMIN', 'RECEPTIONIST'] },
  { href: '/prescriptions', label: 'Prescriptions', icon: FileText, roles: ['CLINIC_ADMIN', 'DOCTOR'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['CLINIC_ADMIN'] },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['CLINIC_ADMIN'] },
];

export function Sidebar({ collapsed, onToggle, onNavigate }: { collapsed: boolean; onToggle: () => void; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, switchClinic } = useAuth();
  const queryClient = useQueryClient();

  const isClinicMode = !!user?.clinicId;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isClinicAdmin = user?.isClinicAdmin === true;
  const navItems = (isSuperAdmin && !isClinicMode) ? superAdminNavItems : clinicNavItems;
  const filteredItems = navItems.filter((item) => {
    if (!('roles' in item)) return true;
    if (isClinicAdmin) return true;
    if (isSuperAdmin && isClinicMode) return true;
    return user && (item as any).roles.includes(user.role);
  });

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onToggle} />
      )}
      <aside className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card text-sidebar-foreground shadow-sm transition-all duration-300',
        collapsed ? '-translate-x-full' : 'translate-x-0',
        'w-64'
      )}>
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-tight text-[#0F172A]">ClinicManager</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-primary">Hospital OPD</span>
          </div>
          <button onClick={onToggle} className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Main Menu</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {isSuperAdmin && isClinicMode && (
          <div className="px-3 pb-2">
            <button
              onClick={async () => { await switchClinic(); queryClient.clear(); router.push('/dashboard'); onNavigate?.(); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Exit Clinic</span>
            </button>
          </div>
        )}

        <div className="border-t p-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0F172A] truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.isClinicAdmin && user.role === 'DOCTOR' ? 'Doctor Admin' : user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
