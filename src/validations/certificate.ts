import { z } from "zod";

export const createCertificateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  provider: z.string().trim().max(120).optional().nullable(),
  credentialUrl: z.string().url().max(1000).optional().nullable(),
  issuedAt: z.coerce.date(),
});
