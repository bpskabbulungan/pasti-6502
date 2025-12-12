"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Sparkles,
  UserRound,
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
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
    <Card className="border border-custom/80 bg-white/80 shadow-xl backdrop-blur dark:bg-card">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-primary-color">
          Login Admin
        </CardTitle>
        <p className="text-sm text-secondary-color">
          Masukkan kredensial aman untuk mengakses dashboard layanan.
        </p>
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
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
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
  );
}

export default LoginForm;
