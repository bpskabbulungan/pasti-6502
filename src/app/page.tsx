"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck, Sparkles, UserRound } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      const response = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (response?.error) {
        toast.error("Username atau password salah");
        return;
      }

      toast.success("Login berhasil");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Terjadi kesalahan saat login");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(154,5,1,0.12),transparent_30%)]" />
      <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row lg:items-center">
        <div className="space-y-6 lg:flex-1">
          <Badge variant="secondary" className="border-border/60 bg-white/70 text-primary-color shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            PASTI 6502
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-black leading-tight text-primary-color sm:text-4xl">
              Pelayanan Statistik Terpadu Terintegrasi
            </h1>
            <div className="max-w-2xl space-y-3 text-base text-secondary-color sm:text-lg">
              <p>
                PASTI bukan sekadar akronim; ini standar layanan yang menuntun setiap proses, dari kedatangan hingga kebutuhan data terpenuhi.
              </p>
              <p>
                Kami memastikan antrean tertib, alur yang jelas, dan kepastian waktu yang terukur. Masyarakat tidak hanya mendapatkan data yang dibutuhkan, tetapi juga pengalaman pelayanan yang nyaman dan terpercaya.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Kelola Antrean</p>
                <p className="text-sm text-secondary-color">Atur jalur antrean yang tertib sejak pendaftaran hingga pelayanan selesai.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-accent/10 p-2 text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Responden SKD</p>
                <p className="text-sm text-secondary-color">Pantau pengunjung agar menyelesaikan Survei Kebutuhan Data dengan cepat dan akurat.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-secondary/10 p-2 text-secondary-foreground">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Akses Aman</p>
                <p className="text-sm text-secondary-color">Autentikasi admin menjaga keamanan data antrean dan hasil survei.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:flex-1">
          <Card className="border border-custom/80 bg-white/80 shadow-xl backdrop-blur dark:bg-card">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-primary-color">Login Admin</CardTitle>
              <p className="text-secondary-color text-sm">Masukkan kredensial aman untuk mengakses dashboard layanan.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <div className="relative">
                          <UserRound className="text-secondary-color absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                          <FormControl>
                            <Input
                              placeholder="contoh: adminpst"
                              className="pl-9"
                              autoComplete="username"
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
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <LockKeyhole className="text-secondary-color absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan password"
                              className="pl-9 pr-12"
                              autoComplete="current-password"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            className="text-secondary-color absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition hover:text-primary"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
                  </Button>
                </form>
              </Form>

              <Button
                variant="outline"
                className="w-full gap-2 border-border"
                onClick={() => router.push("/queue-display")}
              >
                Lihat Tampilan Antrean
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
