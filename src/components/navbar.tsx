'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Bell, LogOut, Menu, PanelLeft, User } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/doctors': 'Doctors',
  '/patients': 'Patients',
  '/visits': 'OPD Visits',
  '/payments': 'Payments',
  '/prescriptions': 'Prescriptions',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const profilePathPattern = /^\/patients\/[^/]+$/;

export function Navbar({ sidebarCollapsed, onToggle }: { sidebarCollapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || (profilePathPattern.test(pathname) ? 'Patient Profile' : 'Dashboard');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onToggle} className="text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg shrink-0">
          {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div>
          <h1 className="text-base font-semibold text-[#0F172A]">{title}</h1>
          <p className="text-xs text-[#475569] hidden sm:block">Hospital OPD Management</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg" onClick={() => toast({ title: 'Coming Soon', description: 'Notifications feature is not yet available', variant: 'default' })}>
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 rounded-lg pl-2 pr-3 hover:bg-[#F8FAFC]">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[#0F172A] hidden sm:block">{user?.firstName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-[#E2E8F0] shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] rounded-xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-[#0F172A] leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-[#475569]">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-lg">
              <User className="mr-2 h-4 w-4 text-[#475569]" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 rounded-lg">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
