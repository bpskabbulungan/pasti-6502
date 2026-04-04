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
  allowedRoles: Role[];
};

export type DashboardAdminItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
  {
    title: "Antrean",
    href: "/dashboard/queue",
    icon: ListChecks,
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
  {
    title: "Analisis",
    href: "/dashboard/analytics",
    icon: BarChart4,
    allowedRoles: [Role.ADMIN],
  },
  {
    title: "Buku Tamu",
    href: "/dashboard/guestbook",
    icon: BookOpenText,
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
  {
    title: "Panduan",
    href: "/dashboard/guide",
    icon: BookOpenCheck,
    allowedRoles: [Role.ADMIN, Role.PETUGAS],
  },
];

export const dashboardAdminItems: DashboardAdminItem[] = [
  {
    title: "Kelola Pengguna",
    href: "/dashboard/users",
    icon: UserCog,
  },
  {
    title: "Kelola Layanan",
    href: "/dashboard/services",
    icon: Wrench,
  },
  {
    title: "QR Buku Tamu",
    href: "/dashboard/qrcode",
    icon: QrCode,
  },
  {
    title: "Jadwal Petugas",
    href: "/dashboard/duty-schedule",
    icon: CalendarClock,
  },
];
