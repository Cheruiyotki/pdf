import { z } from "zod";
import { toolSlugs } from "./tools";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2)
});

export const createJobSchema = z.object({
  toolSlug: z.enum(toolSlugs as [string, ...string[]]),
  options: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  fastMode: z.boolean().optional()
});

export const supportSchema = z.object({
  type: z.enum(["bug", "support"]),
  email: z.string().email(),
  message: z.string().min(10),
  toolSlug: z.string().optional()
});
