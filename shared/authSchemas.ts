import { z } from "zod";

export const Email = z.string().email().max(254);
export const Password = z.string().min(8).max(128);
export const Username = z.string().min(3).max(20);

export const RegisterInput = z.object({ 
  email: Email, 
  password: Password, 
  username: Username,
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional()
});

export const LoginInput = z.object({ 
  email: z.string().min(1, "Email or username is required"), // Allow username or email
  password: Password 
});

export const ResetStartInput = z.object({ 
  email: Email 
});

export const ResetFinishInput = z.object({ 
  token: z.string().min(16), 
  password: Password 
});

export type RegisterInputType = z.infer<typeof RegisterInput>;
export type LoginInputType = z.infer<typeof LoginInput>;
export type ResetStartInputType = z.infer<typeof ResetStartInput>;
export type ResetFinishInputType = z.infer<typeof ResetFinishInput>;