import {
  BarChart4,
  BookOpenCheck,
  BookOpenText,
  CalendarClock,
  LayoutDashboard,
  ListChecks,
  QrCode,
  UserCog,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Role } from "@/shared/constants/enums";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  iconClassName: string;
  allowedRoles: Role[];
};

export type DashboardAdminItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  iconClassName: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    iconClassName: "text-sky-500 dark:text-sky-400",
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
  {
    title: "Antrean",
    href: "/dashboard/queue",
    icon: ListChecks,
    iconClassName: "text-emerald-500 dark:text-emerald-400",
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
  {
    title: "Buku Tamu",
    href: "/dashboard/guestbook",
    icon: BookOpenText,
    iconClassName: "text-orange-500 dark:text-orange-400",
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
  {
    title: "Analisis",
    href: "/dashboard/analytics",
    icon: BarChart4,
    iconClassName: "text-amber-500 dark:text-amber-400",
    allowedRoles: [Role.ADMIN],
  },
  {
    title: "Panduan",
    href: "/dashboard/guide",
    icon: BookOpenCheck,
    iconClassName: "text-violet-500 dark:text-violet-400",
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
];

export const dashboardAdminItems: DashboardAdminItem[] = [
  {
    title: "Kelola Pengguna",
    href: "/dashboard/users",
    icon: UserCog,
    iconClassName: "text-indigo-500 dark:text-indigo-400",
  },
  {
    title: "Kelola Layanan",
    href: "/dashboard/services",
    icon: Wrench,
    iconClassName: "text-teal-500 dark:text-teal-400",
  },
  {
    title: "QR Buku Tamu",
    href: "/dashboard/qrcode",
    icon: QrCode,
    iconClassName: "text-fuchsia-500 dark:text-fuchsia-400",
  },
  {
    title: "Jadwal Petugas",
    href: "/dashboard/duty-schedule",
    icon: CalendarClock,
    iconClassName: "text-rose-500 dark:text-rose-400",
  },
];
