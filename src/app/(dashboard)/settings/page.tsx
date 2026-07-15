'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { prescriptionTemplates, type TemplateId } from '@/components/prescription-templates';
import { Check, Upload, PenLine, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: clinic, isLoading: clinicLoading } = useQuery({
    queryKey: ['settings-clinic'],
    queryFn: async () => { const res = await api.get('/settings/clinic'); return res.data.data; },
  });

  const { data: whatsapp } = useQuery({
    queryKey: ['settings-whatsapp'],
    queryFn: async () => { const res = await api.get('/settings/whatsapp'); return res.data.data; },
  });

  const { data: template } = useQuery({
    queryKey: ['settings-template'],
    queryFn: async () => { const res = await api.get('/settings/prescription-template'); return res.data.data; },
  });

  const { data: doctors } = useQuery({
    queryKey: ['settings-doctors'],
    queryFn: async () => { const res = await api.get('/doctors', { params: { limit: 100 } }); return res.data.data; },
  });

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [clinicForm, setClinicForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [whatsappForm, setWhatsappForm] = useState({ enabled: false, apiKey: '', phoneNumberId: '' });
  const [formInitialized, setFormInitialized] = useState(false);

  // Initialize forms from server data once loaded
  if (!formInitialized && clinic && whatsapp) {
    setClinicForm({ name: clinic.name || '', email: clinic.email || '', phone: clinic.phone || '', address: clinic.address || '' });
    setWhatsappForm({ enabled: !!whatsapp.enabled, apiKey: whatsapp.apiKey || '', phoneNumberId: whatsapp.phoneNumberId || '' });
    setFormInitialized(true);
  }

  const updateClinic = useMutation({
    mutationFn: async (data: any) => { await api.put('/settings/clinic', data); },
    onSuccess: () => { toast({ title: 'Success', description: 'Clinic info updated', variant: 'success' }); queryClient.invalidateQueries({ queryKey: ['settings-clinic'] }); },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  const updateWhatsapp = useMutation({
    mutationFn: async (data: any) => { await api.put('/settings/whatsapp', data); },
    onSuccess: () => { toast({ title: 'Success', description: 'WhatsApp config updated', variant: 'success' }); },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  const updateTemplate = useMutation({
    mutationFn: async (data: any) => { await api.put('/settings/prescription-template', data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings-template'] }); },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Failed', variant: 'destructive' }),
  });

  const uploadSignature = useMutation({
    mutationFn: async ({ doctorId, file }: { doctorId: string; file: File }) => {
      const formData = new FormData();
      formData.append('signature', file);
      await api.put(`/doctors/${doctorId}/signature`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Signature uploaded', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['settings-doctors'] });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message || 'Upload failed', variant: 'destructive' }),
  });

  const selectedDoctor = (doctors || []).find((d: any) => d.id === selectedDoctorId);

  if (clinicLoading) return <div className="space-y-4"><Skeleton className="h-44 rounded-xl" /><Skeleton className="h-44 rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F172A]">Settings</h2>
        <p className="text-sm text-[#475569]">Manage clinic configuration</p>
      </div>

      <Tabs defaultValue="clinic">
        <TabsList className="rounded-lg">
          <TabsTrigger value="clinic" className="rounded-md">Clinic</TabsTrigger>
          <TabsTrigger value="prescription" className="rounded-md">Prescription</TabsTrigger>
          <TabsTrigger value="whatsapp" className="rounded-md">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="mt-6">
          <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-[#0F172A]">Clinic Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateClinic.mutate(clinicForm); }} className="space-y-4 max-w-lg">
                <div className="space-y-1.5"><Label className="text-sm text-[#0F172A]">Clinic Name</Label><Input className="rounded-lg border-[#E2E8F0]" value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-sm text-[#0F172A]">Email</Label><Input type="email" className="rounded-lg border-[#E2E8F0]" value={clinicForm.email} onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-sm text-[#0F172A]">Phone</Label><Input className="rounded-lg border-[#E2E8F0]" value={clinicForm.phone} onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-sm text-[#0F172A]">Address</Label><Input className="rounded-lg border-[#E2E8F0]" value={clinicForm.address} onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })} /></div>
                <Button type="submit" className="rounded-lg">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="mt-6">
          <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-[#0F172A]">Prescription Template</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6 max-w-2xl">
                {/* Template Selector */}
                <div>
                  <Label className="text-sm text-[#0F172A] mb-3 block">Choose Template</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.values(prescriptionTemplates).map((t) => {
                      const isSelected = (template?.templateId || 'classic') === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateTemplate.mutate({ ...template, templateId: t.id })}
                          className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <div className="w-full h-16 rounded-lg mb-3" style={{ backgroundColor: t.color, opacity: 0.85 }} />
                          <p className="text-sm font-semibold text-[#0F172A]">{t.name}</p>
                          <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{t.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC]">
                    <Label className="text-sm text-[#0F172A]">Show Logo</Label>
                    <Switch checked={template?.showLogo ?? true} onCheckedChange={(checked) => updateTemplate.mutate({ ...template, showLogo: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC]">
                    <Label className="text-sm text-[#0F172A]">Show Doctor Signature</Label>
                    <Switch checked={template?.showDoctorSignature ?? true} onCheckedChange={(checked) => updateTemplate.mutate({ ...template, showDoctorSignature: checked })} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC]">
                    <Label className="text-sm text-[#0F172A]">Show QR Code</Label>
                    <Switch checked={template?.showQRCode ?? true} onCheckedChange={(checked) => updateTemplate.mutate({ ...template, showQRCode: checked })} />
                  </div>
                </div>

                {/* Doctor Signature Upload */}
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <Label className="text-sm text-[#0F172A] mb-3 block">Doctor Signature</Label>
                  <div className="space-y-3">
                    <select
                      className="w-full max-w-sm rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                    >
                      <option value="">Select Doctor</option>
                      {(doctors || []).map((d: any) => (
                        <option key={d.id} value={d.id}>Dr. {d.user?.firstName} {d.user?.lastName}</option>
                      ))}
                    </select>

                    {selectedDoctorId && (
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="shrink-0">
                          {selectedDoctor?.signature ? (
                            <div className="relative">
                              <img src={selectedDoctor.signature} alt="Signature" className="h-20 w-40 object-contain bg-white rounded border border-[#E2E8F0]" />
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Remove this signature?')) {
                                    api.put(`/doctors/${selectedDoctorId}`, { signature: null }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['settings-doctors'] });
                                      toast({ title: 'Removed', description: 'Signature removed', variant: 'success' });
                                    });
                                  }
                                }}
                                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-20 w-40 bg-white rounded border-2 border-dashed border-[#CBD5E1] flex items-center justify-center text-[#94A3B8] text-xs">
                              No signature
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-xs text-[#64748B]">Upload a handwritten signature image (JPEG, PNG). It will appear on all prescriptions by this doctor.</p>
                          <input
                            ref={signatureInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && selectedDoctorId) {
                                uploadSignature.mutate({ doctorId: selectedDoctorId, file });
                              }
                              if (signatureInputRef.current) signatureInputRef.current.value = '';
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => signatureInputRef.current?.click()}
                            disabled={uploadSignature.isPending}
                          >
                            <Upload className="h-3.5 w-3.5 mr-1.5" />
                            {uploadSignature.isPending ? 'Uploading...' : selectedDoctor?.signature ? 'Change Signature' : 'Upload Signature'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <Card className="border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-[#0F172A]">WhatsApp Integration</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); updateWhatsapp.mutate(whatsappForm); }} className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC]">
                  <Label className="text-sm text-[#0F172A]">Enable WhatsApp</Label>
                  <Switch checked={whatsappForm.enabled} onCheckedChange={(checked) => setWhatsappForm({ ...whatsappForm, enabled: checked })} />
                </div>
                <div className="space-y-1.5"><Label className="text-sm text-[#0F172A]">API Key</Label><Input type="password" className="rounded-lg border-[#E2E8F0]" value={whatsappForm.apiKey} onChange={(e) => setWhatsappForm({ ...whatsappForm, apiKey: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-sm text-[#0F172A]">Phone Number ID</Label><Input className="rounded-lg border-[#E2E8F0]" value={whatsappForm.phoneNumberId} onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })} /></div>
                <Button type="submit" className="rounded-lg">Save</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
