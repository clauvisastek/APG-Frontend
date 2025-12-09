import { z } from 'zod';
import { ProjectType, Currency, Country } from '../types';

// Client Validation Schema
export const clientSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(150, 'Le nom ne peut pas dépasser 150 caractères'),
  code: z.string()
    .max(50, 'Le code ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]*$/, 'Le code ne peut contenir que des lettres, chiffres, - et _')
    .optional()
    .or(z.literal('')),
  sectorId: z.number({
    message: 'Veuillez sélectionner un secteur',
  }),
  businessUnitId: z.number({
    message: 'Veuillez sélectionner une business unit',
  }),
  countryId: z.number({
    message: 'Veuillez sélectionner un pays',
  }),
  currencyId: z.number({
    message: 'Veuillez sélectionner une devise',
  }),
  defaultTargetMarginPercent: z.number({
    message: 'La marge cible doit être un nombre',
  })
    .min(0, 'La marge cible doit être supérieure ou égale à 0')
    .max(100, 'La marge cible ne peut pas dépasser 100%')
    .optional(),
  defaultMinimumMarginPercent: z.number({
    message: 'La marge minimale doit être un nombre',
  })
    .min(0, 'La marge minimale doit être supérieure ou égale à 0')
    .max(100, 'La marge minimale ne peut pas dépasser 100%')
    .optional(),
  contactName: z.string()
    .min(1, 'Le nom du contact est obligatoire')
    .max(100, 'Le nom du contact ne peut pas dépasser 100 caractères'),
  contactEmail: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email du contact est obligatoire'),
});

// Project Validation Schema
export const projectSchema = z.object({
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  code: z.string()
    .max(50, 'Le code ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]*$/, 'Le code ne peut contenir que des lettres, chiffres, - et _')
    .optional()
    .or(z.literal('')),
  clientId: z.string({
    message: 'Veuillez sélectionner un client',
  })
    .min(1, 'Veuillez sélectionner un client'),
  type: z.nativeEnum(ProjectType, {
    message: 'Veuillez sélectionner un type de projet',
  }),
  responsibleId: z.string().optional().or(z.literal('')),
  currency: z.nativeEnum(Currency, {
    message: 'Veuillez sélectionner une devise',
  }),
  startDate: z.string({
    message: 'La date de début est obligatoire',
  })
    .min(1, 'La date de début est obligatoire'),
  endDate: z.string({
    message: 'La date de fin est obligatoire',
  })
    .min(1, 'La date de fin est obligatoire'),
  targetMargin: z.number({
    message: 'La marge cible doit être un nombre',
  })
    .min(0.01, 'La marge cible doit être supérieure à 0')
    .max(100, 'La marge cible ne peut pas dépasser 100%'),
  minMargin: z.number({
    message: 'La marge minimale doit être un nombre',
  })
    .min(0, 'La marge minimale doit être supérieure ou égale à 0')
    .max(100, 'La marge minimale ne peut pas dépasser 100%'),
  notes: z.string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'La date de fin doit être postérieure ou égale à la date de début',
  path: ['endDate'],
}).refine((data) => data.minMargin <= data.targetMargin, {
  message: 'La marge minimale doit être inférieure ou égale à la marge cible',
  path: ['minMargin'],
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
