import { z } from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be less than 50 characters"),
  email: z.email(),
  password: z.string(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username must be less than 50 characters"),
  description: z.string().optional(),
  ownerId: z.number().gt(0, "Owner ID must be greater than 0"),
});

export const accessSchema = z.object({
  memberId: z.number().gt(0, "Member ID must be greater than 0"),
})