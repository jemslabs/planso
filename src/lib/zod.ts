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
});

export const accessSchema = z.object({
  memberId: z.number().gt(0, "Member ID must be greater than 0"),
});

export const addPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  platforms: z.array(
    z.enum(["LINKEDIN", "X", "THREADS", "INSTAGRAM", "YOUTUBE"])
  ).min(1, "At least one platform is required"),
  organizationId: z.string(),
});

export const addFeedbackSchema = z.object({
  postId: z.number(),
  feedback: z.string()
})