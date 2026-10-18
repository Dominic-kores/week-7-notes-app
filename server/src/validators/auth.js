
import { z } from "zod";

// Registration requires a name, valid email and strong password.
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().email().max(254)
    .transform((email) => email.toLowerCase()),

  password: z.string()
    .min(8, "Password must have at least 8 characters")
    .max(72, "Password must not exceed 72 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number"),
}).strict();

// Login validates supplied credentials.
export const loginSchema = z.object({
  email: z.string().trim().email()
    .transform((email) => email.toLowerCase()),

  password: z.string().min(1),
}).strict();
