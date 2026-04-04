"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { markNavigationPending } from "@/lib/navigation-pending";
import {
  LOGIN_PASSWORD_MAX_LENGTH,
  LOGIN_USERNAME_MAX_LENGTH,
  LoginCredentials,
  loginCredentialsSchema,
} from "@/lib/validation/login-credentials";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginCredentials) {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await signIn("credentials", {
        username: data.username.trim(),
        password: data.password,
        redirect: false,
      });

      if (response?.error || !response?.ok) {
        toast.error("Username atau password salah");
        return;
      }

      toast.success("Login berhasil");
      markNavigationPending();
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Terjadi kesalahan saat login");
      console.error("Login request failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  const isSubmitDisabled = isLoading || !form.formState.isValid;

  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card/92 shadow-[var(--shadow-strong)] backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_18%,transparent),transparent)]" />
      <CardHeader className="relative space-y-2 pb-4 text-center">
        <CardTitle className="text-2xl font-black tracking-tight text-primary-color">
          Masuk ke Dashboard
        </CardTitle>
        <p className="text-sm text-secondary-color">
          Masuk dengan akun internal untuk mengakses dashboard layanan.
        </p>
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs font-medium text-secondary-color">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Koneksi dan sesi terlindungi
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel>Username</FormLabel>
                  <div className="relative">
                    <UserRound className="text-secondary-color absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <FormControl>
                      <Input
                        placeholder="contoh: pstuser"
                        className="pl-9"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        inputMode="text"
                        maxLength={LOGIN_USERNAME_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <LockKeyhole className="text-secondary-color absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        className="pl-9 pr-12"
                        autoComplete="current-password"
                        maxLength={LOGIN_PASSWORD_MAX_LENGTH}
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="text-secondary-color absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition hover:text-primary"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/35 px-3 py-2 text-xs leading-relaxed text-secondary-color">
              Demi keamanan, hindari login dari perangkat umum dan jangan membagikan kredensial
              akun.
            </p>
            <Button
              type="submit"
              className="h-11 w-full gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              disabled={isSubmitDisabled}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk Dashboard"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
