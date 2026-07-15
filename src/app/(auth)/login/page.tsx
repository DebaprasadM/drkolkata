'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { checkSessions } from '@/lib/auth';
import { Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { AlertDialog } from '@/components/ui/alert-dialog';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionDeviceCount, setSessionDeviceCount] = useState(0);

  const doLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.response?.data?.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await checkSessions(email);
      if (result.hasActiveSession) {
        setSessionDeviceCount(result.deviceCount);
        setShowSessionWarning(true);
        setLoading(false);
        return;
      }
      await doLogin();
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.response?.data?.message || 'Invalid credentials', variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">ClinicManager</h1>
          <p className="text-sm text-[#475569]">Enterprise OPD Management System</p>
        </div>
      </div>

      <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] rounded-xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg text-[#0F172A]">Sign in</CardTitle>
          <CardDescription className="text-[#475569]">Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#0F172A]">Email</Label>
              <Input id="email" type="email" placeholder="doctor@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-[#0F172A]">Password</Label>
                <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-lg border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-11" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-medium transition-all" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-[#94A3B8]">
        Secure enterprise healthcare platform
      </p>

      <AlertDialog
        open={showSessionWarning}
        onOpenChange={setShowSessionWarning}
        title="Already logged in elsewhere"
        description={`You are already logged in on ${sessionDeviceCount} other device(s). Logging in here will log you out from there.`}
        confirmText="Continue"
        cancelText="Cancel"
        onConfirm={doLogin}
      >
        <div className="flex justify-center py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
