import { z } from "zod";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
const CONTROL_CHARACTER_REGEX = /[\u0000-\u001F\u007F]/;

export const LOGIN_USERNAME_MAX_LENGTH = 32;
export const LOGIN_PASSWORD_MAX_LENGTH = 72;

export const loginCredentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username harus diisi")
    .max(LOGIN_USERNAME_MAX_LENGTH, `Username maksimal ${LOGIN_USERNAME_MAX_LENGTH} karakter`)
    .regex(
      USERNAME_REGEX,
      "Username hanya boleh berisi huruf, angka, titik, garis bawah, atau strip"
    ),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .max(LOGIN_PASSWORD_MAX_LENGTH, `Password maksimal ${LOGIN_PASSWORD_MAX_LENGTH} karakter`)
    .refine(
      (value) => !CONTROL_CHARACTER_REGEX.test(value),
      "Password mengandung karakter yang tidak valid"
    ),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
