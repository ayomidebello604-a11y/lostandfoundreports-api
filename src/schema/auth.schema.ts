import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(30),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string()
})

export type LoginInput = z.infer<typeof LoginSchema>