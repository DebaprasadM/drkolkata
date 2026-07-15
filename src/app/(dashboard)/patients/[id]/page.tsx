'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
const photoUrl = (url: string) => url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ArrowLeft, User, Activity, CreditCard, FileText, Phone, Calendar, Hash, Image as ImageIcon, Upload, Trash2, X, Maximize2, Clock, Stethoscope, MessageCircle, Eye, Share2 } from 'lucide-react';
import type { Patient } from '@/types';

interface HistoryPatient extends Patient {
  visits: any[];
  payments: any[];
  prescriptions: any[];
  treatmentPhotos: any[];
}

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const patientId = params.id as string;
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: async () => {
      const res = await api.get(`/patients/${patientId}/history`);
      return res.data.data as HistoryPatient;
    },
    enabled: !!patientId,
  });

  const { data: photos, refetch: refetchPhotos } = useQuery({
    queryKey: ['patient-photos', patientId],
    queryFn: async () => {
      const res = await api.get(`/patients/${patientId}/photos`);
      return res.data.data as any[];
    },
    enabled: !!patientId,
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      await api.delete(`/patients/photos/${photoId}`);
    },
    onSuccess: () => {
      refetchPhotos();
      setDeleteConfirm(null);
      toast({ title: 'Success', description: 'Photo deleted', variant: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Delete failed', variant: 'destructive' });
    },
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await api.post(`/patients/${patientId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      refetchPhotos();
      toast({ title: 'Success', description: 'Photo uploaded successfully', variant: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#475569]">
        <User className="h-16 w-16 mb-4 text-[#94A3B8]" />
        <p className="text-lg font-medium">Patient not found</p>
        <Button variant="outline" className="mt-4 rounded-lg" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const allPhotos = photos || patient.treatmentPhotos || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-lg shrink-0">
          <ArrowLeft className="h-5 w-5 text-[#475569]" />
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#0F172A]">{patient.firstName} {patient.lastName}</h1>
            <Badge variant="outline" className="text-xs font-mono bg-[#F8FAFC] border-[#E2E8F0]">{patient.patientId}</Badge>
          </div>
          <p className="text-sm text-[#475569] flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" /> {patient.phone}
            {patient.email && <><span className="text-[#CBD5E1]">|</span> {patient.email}</>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Visits', value: patient.visits?.length || 0, color: 'text-primary', icon: Activity },
          { label: 'Payments', value: patient.payments?.length || 0, color: 'text-emerald-600', icon: CreditCard },
          { label: 'Prescriptions', value: patient.prescriptions?.length || 0, color: 'text-blue-600', icon: FileText },
          { label: 'Photos', value: allPhotos.length, color: 'text-purple-600', icon: ImageIcon },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#E2E8F0] p-4 text-center hover:shadow-sm transition-shadow">
            <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#475569] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-xl overflow-x-auto bg-[#F8FAFC] p-1 border border-[#E2E8F0]">
          <TabsTrigger value="profile" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="visits" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Activity className="h-4 w-4" /> Visits ({patient.visits?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><CreditCard className="h-4 w-4" /> Payments ({patient.payments?.length || 0})</TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><FileText className="h-4 w-4" /> Prescriptions ({patient.prescriptions?.length || 0})</TabsTrigger>
          <TabsTrigger value="photos" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"><ImageIcon className="h-4 w-4" /> Photos ({allPhotos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              {[
                { icon: Hash, label: 'Patient ID', value: patient.patientId },
                { icon: User, label: 'Gender', value: patient.gender },
                { icon: Calendar, label: 'Age', value: patient.age ? `${patient.age} years` : 'N/A' },
                { icon: Phone, label: 'Phone', value: patient.phone },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#F8FAFC] flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-[#94A3B8]" />
                  <div><span className="text-[#475569]">{item.label}:</span> <span className="font-medium text-[#0F172A] ml-1">{item.value}</span></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                { icon: Activity, label: 'Blood Group', value: patient.bloodGroup || 'N/A' },
                { icon: ImageIcon, label: 'Email', value: patient.email || 'N/A' },
                { icon: FileText, label: 'Address', value: patient.address || 'N/A' },
                { icon: Clock, label: 'Registered', value: formatDate(patient.createdAt) },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#F8FAFC] flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-[#94A3B8]" />
                  <div><span className="text-[#475569]">{item.label}:</span> <span className="font-medium text-[#0F172A] ml-1">{item.value}</span></div>
                </div>
              ))}
            </div>
          </div>
          {patient.medicalNotes && (
            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">Medical Notes</p>
              <p className="text-sm text-[#0F172A]">{patient.medicalNotes}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="visits" className="mt-6">
          {patient.visits?.length ? (
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Token</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Doctor</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.visits.map((visit: any) => (
                    <TableRow key={visit.id} className="hover:bg-[#F8FAFC]">
                      <TableCell className="font-mono text-sm font-bold text-primary">#{visit.tokenNumber}</TableCell>
                      <TableCell className="text-[#0F172A]">Dr. {visit.doctor?.user?.firstName} {visit.doctor?.user?.lastName}</TableCell>
                      <TableCell className="hidden sm:table-cell text-[#475569]">{visit.consultationType}</TableCell>
                      <TableCell className="text-[#475569]">{formatDate(visit.visitDate)}</TableCell>
                      <TableCell><Badge className={getStatusColor(visit.status)}>{visit.status.replace('_', ' ')}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#475569]">
              <Activity className="h-12 w-12 mb-3 text-[#94A3B8]" />
              <p className="font-medium">No visit records found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          {patient.payments?.length ? (
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Receipt</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Net</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Method</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.payments.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-[#F8FAFC]">
                      <TableCell className="font-mono text-xs text-[#0F172A]">{payment.receiptNumber}</TableCell>
                      <TableCell className="hidden sm:table-cell text-[#475569]">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="font-medium text-[#0F172A]">{formatCurrency(payment.netAmount)}</TableCell>
                      <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs border-[#E2E8F0]">{payment.paymentMethod}</Badge></TableCell>
                      <TableCell><Badge className={`${getStatusColor(payment.paymentStatus)} text-xs`}>{payment.paymentStatus}</Badge></TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-[#475569]">{formatDate(payment.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#475569]">
              <CreditCard className="h-12 w-12 mb-3 text-[#94A3B8]" />
              <p className="font-medium">No payment records found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          {patient.prescriptions?.length ? (
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC]">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Prescription No.</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Doctor</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Medicines</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.prescriptions.map((rx: any) => (
                    <TableRow key={rx.id} className="hover:bg-[#F8FAFC]">
                      <TableCell className="font-mono text-xs text-[#0F172A]">{rx.prescriptionNo}</TableCell>
                      <TableCell className="hidden sm:table-cell text-[#475569]">Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}</TableCell>
                      <TableCell className="text-[#475569]">{rx.medicines?.length || 0} items</TableCell>
                      <TableCell className="hidden md:table-cell text-[#475569]">{formatDate(rx.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <a href={`/prescriptions/${rx.prescriptionNo}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary" title="View Prescription">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600" title="Share via WhatsApp" onClick={() => {
                            const phone = patient.whatsappNumber || patient.phone || '';
                            const cleanPhone = phone.replace(/[^0-9]/g, '');
                            const shareUrl = `${window.location.origin}/prescriptions/${rx.prescriptionNo}`;
                            const message = encodeURIComponent(`Hi ${patient.firstName},\n\nYour prescription is ready.\n\nPrescription No: ${rx.prescriptionNo}\n\nView:\n${shareUrl}`);
                            window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                          }}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#475569]">
              <FileText className="h-12 w-12 mb-3 text-[#94A3B8]" />
              <p className="font-medium">No prescriptions found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#475569]">Treatment photos help track patient progress visually.</p>
              <label className="cursor-pointer">
                <Button asChild variant="default" className="rounded-lg gap-2" disabled={uploading}>
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>

            {allPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allPhotos.map((photo: any) => (
                  <div key={photo.id} className="group relative rounded-xl border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] hover:shadow-md transition-all">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={photoUrl(photo.url)}
                        alt={photo.caption || 'Treatment photo'}
                        className="h-full w-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                        onClick={() => setPreviewPhoto(photo.url)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setPreviewPhoto(photo.url)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                          <Maximize2 className="h-4 w-4 text-[#0F172A]" />
                        </button>
                        {deleteConfirm === photo.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => deletePhoto.mutate(photo.id)} className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <X className="h-4 w-4 text-[#0F172A]" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(photo.id)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    {photo.caption && (
                      <div className="p-2">
                        <p className="text-xs text-[#475569] truncate">{photo.caption}</p>
                      </div>
                    )}
                    <p className="px-2 pb-2 text-[10px] text-[#94A3B8]">{formatDate(photo.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#475569] bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                <ImageIcon className="h-12 w-12 mb-3 text-[#94A3B8]" />
                <p className="font-medium">No treatment photos yet</p>
                <p className="text-sm mt-1">Upload photos to track patient progress</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewPhoto(null)}>
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewPhoto(null)} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors z-10">
              <X className="h-5 w-5 text-white" />
            </button>
            <img src={photoUrl(previewPhoto)} alt="Treatment photo" className="max-h-[90vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
