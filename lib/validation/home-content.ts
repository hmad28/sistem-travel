import { z } from 'zod';

export const homeSections = {
  hero: ['heroTag', 'heroTitle', 'heroDescription', 'browse', 'consult'],
  services: ['serviceTitle', 'serviceDescription', 'umroh', 'umrohText', 'haji', 'hajiText', 'tour', 'tourText'],
  packages: ['recommended', 'recommendedText', 'all'],
  guidance: ['stepsTitle', 'stepsText', 'step1', 'step1Text', 'step2', 'step2Text', 'step3', 'step3Text'],
  contact: ['helpTitle', 'helpText', 'helpAction'],
} as const;
export const homeKeys = Object.values(homeSections).flat();
export type HomeKey = typeof homeKeys[number];
export const homeTextSchema = z.record(z.string(), z.string().trim().max(2000)).superRefine((values, context) => {
  for (const key of Object.keys(values)) {
    if (!homeKeys.includes(key as HomeKey)) context.addIssue({ code: 'custom', message: 'Unknown content field', path: [key] });
  }
});
export const homeDocumentSchema = z.object({
  revision: z.number().int().nonnegative(),
  draft: homeTextSchema,
  published: homeTextSchema,
});
