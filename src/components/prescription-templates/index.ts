import TemplateClassic from './template-classic';
import TemplateModern from './template-modern';
import TemplateMinimal from './template-minimal';
import TemplateElegant from './template-elegant';
import TemplateMedical from './template-medical';

export const prescriptionTemplates = {
  classic: { id: 'classic', name: 'Classic', description: 'Traditional blue letterhead with decorative border', component: TemplateClassic, color: '#1e3a5f' },
  modern: { id: 'modern', name: 'Modern', description: 'Colorful cards with purple gradient header', component: TemplateModern, color: '#7c3aed' },
  minimal: { id: 'minimal', name: 'Minimal', description: 'Clean & simple with elegant typography', component: TemplateMinimal, color: '#0f172a' },
  elegant: { id: 'elegant', name: 'Elegant', description: 'Gold & brown tones with serif fonts', component: TemplateElegant, color: '#C9A96E' },
  medical: { id: 'medical', name: 'Medical', description: 'Professional green medical theme', component: TemplateMedical, color: '#047857' },
} as const;

export type TemplateId = keyof typeof prescriptionTemplates;

export { TemplateClassic, TemplateModern, TemplateMinimal, TemplateElegant, TemplateMedical };
