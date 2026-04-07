import "module-alias/register";
import {
  DayOffType,
  DutyCycleStatus,
  Gender,
  LastEducation,
  Prisma,
  PrismaClient,
  Purpose,
  QueueStatus,
  QueueType,
  ReminderChannel,
  Role,
  ServiceStatus,
  type User,
} from "@prisma/client";
import bcryptjs from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import QRCode from "qrcode";
import crypto from "crypto";

const prisma = new PrismaClient();
const staticUuid = process.env.NEXT_PUBLIC_STATIC_UUID;
const baseUrl = process.env.NEXTAUTH_URL;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  throw new Error("Database seeding is disabled in production to prevent accidental data loss.");
}

if (!staticUuid) {
  throw new Error(
    "NEXT_PUBLIC_STATIC_UUID environment variable must be defined for QR generation."
  );
}
const resolvedStaticUuid: string = staticUuid;

if (!baseUrl) {
  throw new Error("NEXTAUTH_URL environment variable must be defined to generate QR codes.");
}
const resolvedBaseUrl: string = baseUrl;

type SeededCredential = {
  role: Role;
  username: string;
  passwordHint?: string;
  source: string;
};

type SeededUsers = {
  admin: User;
  officers: User[];
  credentials: SeededCredential[];
};

type ServiceByPurpose = Record<Purpose, { id: string; name: string }>;

type DutySeedResult = {
  settingsId: string;
  scheduleByDate: Map<string, string>;
};

type QueueSeedResult = {
  total: number;
  guestQueues: number;
  onlineQueues: number;
  statusCount: Record<QueueStatus, number>;
  snapshots: Array<{
    queueNumber: number;
    queueDate: Date;
    status: QueueStatus;
    queueType: QueueType;
    serviceName: string;
    visitorName: string;
    adminId: string | null;
    createdAt: Date;
  }>;
};

const DEFAULT_DUTY_TEMPLATE =
  "Assalamu'alaikum/selamat pagi {{nama_petugas}}.\n\n" +
  "Pengingat jadwal PST {{hari}}, {{tanggal}}.\n" +
  "Anda dijadwalkan bertugas layanan {{layanan}} di {{lokasi}}.\n\n" +
  "Mohon hadir tepat waktu. Terima kasih.";

const OCCUPATIONS = [
  "Guru/Dosen",
  "Karyawan BUMN",
  "Karyawan Swasta",
  "Pelajar/Mahasiswa",
  "PNS/PPPK",
  "TNI/Polri",
  "Wiraswasta",
  "Lainnya",
] as const;

const EDUCATION_LEVELS = Object.values(LastEducation) as LastEducation[];
const PURPOSES = Object.values(Purpose) as Purpose[];

const PST_OFFICER_SEEDS = [
  {
    name: "Afnita Rahma Auliya Putri",
    phone: "6285882292588",
    username: "afnita.rahma",
  },
  {
    name: "Alphin Pratama Husada",
    phone: "6282261828467",
    username: "alphin.pratama",
  },
  {
    name: "Anuar",
    phone: "6282251097208",
    username: "anuar",
  },
  {
    name: "Bambang Luhat",
    phone: "6282358880344",
    username: "bambang_luhat",
  },
  {
    name: "Chafri Fajar Erwandra",
    phone: "6285784585563",
    username: "chafri.fajar",
  },
  {
    name: "Febri Fatika Sari",
    phone: "6285726025343",
    username: "febri.fatika",
  },
  {
    name: "Fiqah Rochmah Ningtyas Duana Putri",
    phone: "6287764807421",
    username: "fiqah.putri",
  },
  {
    name: "Insan Dienuari",
    phone: "6285730405955",
    username: "insandienuari",
  },
  {
    name: "Jusman",
    phone: "6285159002598",
    username: "jusman",
  },
  {
    name: "Lia Aulia Hayati",
    phone: "6281256530709",
    username: "liaauliahayati",
  },
  {
    name: "Mardiana",
    phone: "6282354058587",
    username: "mar.diana",
  },
  {
    name: "Marinda Saga Putra",
    phone: "6281258149414",
    username: "marindaputra",
  },
  {
    name: "Marini Safa Aziza",
    phone: "6281519961747",
    username: "marinisafa",
  },
  {
    name: "Muhamadsyah",
    phone: "6285294404060",
    username: "muhamadsyah",
  },
  {
    name: "Najwa Fairus Samaya",
    phone: "62895415969010",
    username: "najwa.fairus",
  },
  {
    name: "Novanni Indi Pradana",
    phone: "6283836260392",
    username: "novanniindipradana",
  },
  {
    name: "Rosetina Fini Alsera",
    phone: "6281296036385",
    username: "finialsera",
  },
  {
    name: "Shafa",
    phone: "6287863150050",
    username: "sha.fa",
  },
  {
    name: "Tsabit Bintang Herindra",
    phone: "6285156460949",
    username: "tsabitbintang",
  },
  {
    name: "Warsidi",
    phone: "6281253216991",
    username: "warsidi2",
  },
  {
    name: "Zulkifli",
    phone: "6282350529800",
    username: "zulkifli",
  },
] as const;

const FIRST_NAMES = [
  "Ahmad",
  "Siti",
  "Rizky",
  "Nadia",
  "Dimas",
  "Putri",
  "Fajar",
  "Maya",
  "Ilham",
  "Rina",
  "Budi",
  "Aulia",
  "Rafi",
  "Dea",
  "Farhan",
  "Citra",
  "Fikri",
  "Anisa",
  "Yusuf",
  "Lina",
];

const LAST_NAMES = [
  "Pratama",
  "Rahmawati",
  "Setiawan",
  "Saputri",
  "Hidayat",
  "Putra",
  "Maharani",
  "Siregar",
  "Kurniawan",
  "Nurhaliza",
  "Ramadhan",
  "Lestari",
];

const INSTITUTIONS = [
  "Pemkab Bulungan",
  "Universitas Borneo Tarakan",
  "SMAN 1 Tanjung Selor",
  "Dinas Pendidikan",
  "Dinas Kesehatan",
  "Perumda Air Minum",
  "PT Bulungan Energi",
  "Kecamatan Tanjung Palas",
  "Mahasiswa Mandiri",
  "Pelaku UMKM",
];

const ADDRESSES = [
  "Jl. Kol. Soetadji, Tanjung Selor",
  "Jl. Katamso, Tanjung Selor",
  "Jl. Sengkawit, Tanjung Selor",
  "Jl. Jelarai Raya, Tanjung Selor",
  "Jl. Mangga, Tanjung Selor",
  "Jl. Rambutan, Tanjung Selor",
  "Jl. Durian, Tanjung Selor",
  "Jl. Cendana, Tanjung Selor",
];

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const addMinutes = (date: Date, minutes: number) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() + minutes);
  return value;
};

const atTime = (date: Date, hour: number, minute: number) => {
  const value = new Date(date);
  value.setHours(hour, minute, 0, 0);
  return value;
};

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

const toQueueDateCode = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}${String(date.getMonth() + 1).padStart(2, "0")}`;

const isoWeekday = (date: Date) => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const moveToNearestWeekday = (date: Date, direction: 1 | -1) => {
  let current = startOfDay(date);
  while (isoWeekday(current) > 5) {
    current = addDays(current, direction);
  }
  return current;
};

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Environment variable ${key} wajib diisi untuk proses seed.`);
  }
  return value;
};

const optionalEnvPassword = (
  key: string,
  fallbackPassword?: string
): { password: string; fromEnv: boolean; source: string } => {
  const value = process.env[key]?.trim();
  if (value) {
    return { password: value, fromEnv: true, source: key };
  }

  if (typeof fallbackPassword === "string") {
    return {
      password: fallbackPassword,
      fromEnv: false,
      source: "default",
    };
  }

  return {
    password: crypto.randomBytes(18).toString("base64url"),
    fromEnv: false,
    source: "generated",
  };
};

async function ensureQrCode() {
  const qrCodeDir = path.join(process.cwd(), "public", "qrcodes");
  if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir, { recursive: true });
  }

  const normalizedBaseUrl = resolvedBaseUrl.endsWith("/")
    ? resolvedBaseUrl.slice(0, -1)
    : resolvedBaseUrl;
  const qrCodePath = path.join(qrCodeDir, "pst-qrcode.png");
  const qrCodeUrl = `${normalizedBaseUrl}/guest`;

  await QRCode.toFile(qrCodePath, qrCodeUrl, {
    color: {
      dark: "#13254e",
      light: "#FFFFFF",
    },
    width: 300,
    margin: 1,
  });

  const qrCode = await prisma.qRCode.upsert({
    where: { staticUuid: resolvedStaticUuid },
    update: {
      path: `/qrcodes/pst-qrcode.png`,
    },
    create: {
      staticUuid: resolvedStaticUuid,
      path: `/qrcodes/pst-qrcode.png`,
    },
  });

  console.log(`QR Code created at ${qrCodePath}, with UUID: ${qrCode.staticUuid}`);
}

async function cleanupTransactionalData() {
  await prisma.$transaction([
    prisma.dutyReminderLog.deleteMany(),
    prisma.dutySchedule.deleteMany(),
    prisma.dutyCycle.deleteMany(),
    prisma.dutyDayOff.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.analyticsExportJob.deleteMany(),
    prisma.queueCounter.deleteMany(),
    prisma.queue.deleteMany(),
    prisma.guest.deleteMany(),
    prisma.visitor.deleteMany(),
    prisma.tempVisitorLink.deleteMany(),
  ]);
}

async function seedUsers(): Promise<SeededUsers> {
  const credentials: SeededCredential[] = [];

  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = requiredEnv("SEED_ADMIN_PASSWORD");
  const adminHashedPassword = await bcryptjs.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      password: adminHashedPassword,
      name: "Admin",
      role: Role.ADMIN,
    },
    create: {
      username: adminUsername,
      password: adminHashedPassword,
      name: "Admin",
      role: Role.ADMIN,
    },
  });

  credentials.push({
    role: Role.ADMIN,
    username: admin.username,
    source: "SEED_ADMIN_PASSWORD",
  });

  const operatorPasswordMeta = optionalEnvPassword("SEED_OPERATOR_PASSWORD", "password");
  const operatorHashedPassword = await bcryptjs.hash(operatorPasswordMeta.password, 12);
  const officers: User[] = [];
  const seededUsernames = [adminUsername];

  for (const officerSeed of PST_OFFICER_SEEDS) {
    const username = officerSeed.username.trim();
    const officer = await prisma.user.upsert({
      where: { username },
      update: {
        password: operatorHashedPassword,
        name: officerSeed.name.trim(),
        phone: officerSeed.phone.trim(),
        role: Role.PETUGAS,
      },
      create: {
        username,
        password: operatorHashedPassword,
        name: officerSeed.name.trim(),
        phone: officerSeed.phone.trim(),
        role: Role.PETUGAS,
      },
    });

    officers.push(officer);
    seededUsernames.push(username);
  }

  await prisma.user.deleteMany({
    where: {
      username: {
        notIn: seededUsernames,
      },
    },
  });

  credentials.push({
    role: Role.PETUGAS,
    username: `all-petugas-pst (${PST_OFFICER_SEEDS.length} akun)`,
    passwordHint: operatorPasswordMeta.fromEnv ? undefined : operatorPasswordMeta.password,
    source: operatorPasswordMeta.source,
  });

  return { admin, officers, credentials };
}

async function seedServices(): Promise<ServiceByPurpose> {
  const serviceSeeds = [
    { name: "Perpustakaan", status: ServiceStatus.ACTIVE },
    { name: "Konsultasi Statistik", status: ServiceStatus.ACTIVE },
    { name: "Rekomendasi Statistik", status: ServiceStatus.ACTIVE },
    { name: "Pelayanan DTSEN", status: ServiceStatus.ACTIVE },
  ];

  await prisma.service.deleteMany({
    where: {
      name: {
        notIn: serviceSeeds.map((item) => item.name),
      },
    },
  });

  for (const seed of serviceSeeds) {
    const existingService = await prisma.service.findFirst({
      where: { name: seed.name },
    });

    if (existingService) {
      const service = await prisma.service.update({
        where: { id: existingService.id },
        data: {
          status: seed.status,
        },
        select: {
          name: true,
        },
      });
      console.log(`Updated service: ${service.name}`);
    } else {
      const service = await prisma.service.create({
        data: {
          name: seed.name,
          status: seed.status,
        },
        select: {
          name: true,
        },
      });
      console.log(`Created service: ${service.name}`);
    }
  }

  const services = await prisma.service.findMany({
    where: {
      name: {
        in: serviceSeeds.map((item) => item.name),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const byName = new Map(services.map((service) => [service.name, service]));
  const konsultasi = byName.get("Konsultasi Statistik");
  const perpustakaan = byName.get("Perpustakaan");
  const rekomendasi = byName.get("Rekomendasi Statistik");

  if (!konsultasi || !perpustakaan || !rekomendasi) {
    throw new Error("Service utama tidak lengkap setelah proses seed.");
  }

  return {
    [Purpose.KONSULTASI_STATISTIK]: konsultasi,
    [Purpose.PERPUSTAKAAN]: perpustakaan,
    [Purpose.REKOMENDASI_STATISTIK]: rekomendasi,
    [Purpose.LAINNYA]: konsultasi,
  };
}

async function seedDutyData(officers: User[]): Promise<DutySeedResult> {
  const today = startOfDay(new Date());
  const workDays = [1, 2, 3, 4, 5];

  const settings = await prisma.dutySettings.upsert({
    where: { id: "default" },
    update: {
      workDays,
      reminderEnabled: true,
      autoAssignEnabled: true,
      reminderTemplate: DEFAULT_DUTY_TEMPLATE,
      timezone: "Asia/Makassar",
    },
    create: {
      id: "default",
      workDays,
      reminderEnabled: true,
      autoAssignEnabled: true,
      reminderTemplate: DEFAULT_DUTY_TEMPLATE,
      timezone: "Asia/Makassar",
    },
  });

  const holidayDate = moveToNearestWeekday(addDays(today, 7), 1);
  let leaveDate = moveToNearestWeekday(addDays(today, -3), -1);
  if (toIsoDate(leaveDate) === toIsoDate(holidayDate)) {
    leaveDate = moveToNearestWeekday(addDays(leaveDate, -1), -1);
  }

  await prisma.dutyDayOff.createMany({
    data: [
      {
        date: holidayDate,
        name: "Hari Libur Simulasi",
        type: DayOffType.HOLIDAY,
        note: "Data contoh hari libur",
        settingsId: settings.id,
      },
      {
        date: leaveDate,
        name: "Cuti Petugas Simulasi",
        type: DayOffType.LEAVE,
        note: "Data contoh cuti",
        settingsId: settings.id,
      },
    ],
  });

  const dayOffSet = new Set([toIsoDate(holidayDate), toIsoDate(leaveDate)]);
  const candidateDates: Date[] = [];

  for (let offset = -8; offset <= 8; offset++) {
    const date = startOfDay(addDays(today, offset));
    if (isoWeekday(date) > 5) {
      continue;
    }
    if (dayOffSet.has(toIsoDate(date))) {
      continue;
    }
    candidateDates.push(date);
  }

  const pastDates = candidateDates.filter((date) => date < today);
  const currentAndUpcomingDates = candidateDates.filter((date) => date >= today);
  const staffOrder = officers.map((officer) => officer.id);

  const completedCycle = await prisma.dutyCycle.create({
    data: {
      cycleNumber: 1,
      status: DutyCycleStatus.COMPLETED,
      staffOrder: staffOrder as Prisma.InputJsonValue,
      currentIndex: staffOrder.length,
      startedAt: addDays(today, -20),
      completedAt: addDays(today, -1),
    },
  });

  const activeCycle = await prisma.dutyCycle.create({
    data: {
      cycleNumber: 2,
      status: DutyCycleStatus.ACTIVE,
      staffOrder: staffOrder as Prisma.InputJsonValue,
      currentIndex: 0,
      startedAt: today,
    },
  });

  const schedules: Array<{
    id: string;
    scheduleDate: Date;
    staffId: string;
  }> = [];
  let cursor = 0;

  for (const scheduleDate of pastDates) {
    const staffId = staffOrder[cursor % staffOrder.length];
    const schedule = await prisma.dutySchedule.create({
      data: {
        scheduleDate,
        staffId,
        cycleId: completedCycle.id,
      },
    });
    schedules.push(schedule);
    cursor++;
  }

  for (const scheduleDate of currentAndUpcomingDates) {
    const staffId = staffOrder[cursor % staffOrder.length];
    const schedule = await prisma.dutySchedule.create({
      data: {
        scheduleDate,
        staffId,
        cycleId: activeCycle.id,
      },
    });
    schedules.push(schedule);
    cursor++;
  }

  await prisma.dutyCycle.update({
    where: { id: activeCycle.id },
    data: {
      currentIndex: currentAndUpcomingDates.length % staffOrder.length,
    },
  });

  const reminderTargets = schedules.filter((schedule) => schedule.scheduleDate <= today).slice(-4);

  for (let index = 0; index < reminderTargets.length; index++) {
    const target = reminderTargets[index];
    const success = index % 3 !== 0;
    await prisma.dutyReminderLog.create({
      data: {
        reminderDate: target.scheduleDate,
        staffId: target.staffId,
        scheduleId: target.id,
        settingsId: settings.id,
        phoneNumber: success ? `62852000099${index}` : null,
        message: success
          ? "Pengingat jadwal PST terkirim (seed data)"
          : "Pengingat jadwal PST gagal dikirim (seed data)",
        channel: ReminderChannel.FONNTE,
        success,
        providerResponse: success
          ? ({ status: "seeded", id: `fonnte-seed-${index}` } as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        errorMessage: success ? null : "Nomor WhatsApp petugas belum diisi",
      },
    });
  }

  const scheduleByDate = new Map<string, string>();
  for (const schedule of schedules) {
    scheduleByDate.set(toIsoDate(schedule.scheduleDate), schedule.staffId);
  }

  return {
    settingsId: settings.id,
    scheduleByDate,
  };
}

const createProfile = (index: number, purpose: Purpose) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const fullName = `${firstName} ${lastName}`;
  const normalizedName = `${firstName}.${lastName}`.toLowerCase();

  return {
    fullName,
    email: `${normalizedName}${index + 1}@example.com`,
    phone: `0812${String(7650000 + index).padStart(7, "0")}`,
    address: ADDRESSES[index % ADDRESSES.length],
    age: 19 + (index % 35),
    gender: index % 2 === 0 ? Gender.MALE : Gender.FEMALE,
    lastEducation: EDUCATION_LEVELS[index % EDUCATION_LEVELS.length],
    occupation: OCCUPATIONS[index % OCCUPATIONS.length],
    institution: INSTITUTIONS[index % INSTITUTIONS.length],
    purpose,
  };
};

const statusListFromPlan = (plan: {
  completed: number;
  canceled: number;
  serving: number;
  waiting: number;
}) => [
  ...Array.from({ length: plan.completed }, () => QueueStatus.COMPLETED),
  ...Array.from({ length: plan.canceled }, () => QueueStatus.CANCELED),
  ...Array.from({ length: plan.serving }, () => QueueStatus.SERVING),
  ...Array.from({ length: plan.waiting }, () => QueueStatus.WAITING),
];

async function seedQueues(
  serviceByPurpose: ServiceByPurpose,
  seededUsers: SeededUsers,
  dutySeed: DutySeedResult
): Promise<QueueSeedResult> {
  const today = startOfDay(new Date());
  const activeServiceIds = [
    serviceByPurpose[Purpose.KONSULTASI_STATISTIK].id,
    serviceByPurpose[Purpose.PERPUSTAKAAN].id,
    serviceByPurpose[Purpose.REKOMENDASI_STATISTIK].id,
  ];
  const purposeList = PURPOSES;

  const dayPlans = [
    { dayOffset: -6, completed: 9, canceled: 3, serving: 0, waiting: 0, guestCount: 5 },
    { dayOffset: -5, completed: 10, canceled: 3, serving: 0, waiting: 0, guestCount: 6 },
    { dayOffset: -4, completed: 11, canceled: 3, serving: 0, waiting: 0, guestCount: 7 },
    { dayOffset: -3, completed: 11, canceled: 3, serving: 1, waiting: 0, guestCount: 8 },
    { dayOffset: -2, completed: 12, canceled: 3, serving: 1, waiting: 0, guestCount: 8 },
    { dayOffset: -1, completed: 13, canceled: 3, serving: 1, waiting: 0, guestCount: 9 },
    { dayOffset: 0, completed: 11, canceled: 4, serving: 3, waiting: 6, guestCount: 14 },
  ];

  const statusCount: Record<QueueStatus, number> = {
    WAITING: 0,
    SERVING: 0,
    COMPLETED: 0,
    CANCELED: 0,
  };

  const snapshots: QueueSeedResult["snapshots"] = [];
  const tempVisitorLinks: Prisma.TempVisitorLinkCreateManyInput[] = [];

  let profileIndex = 0;
  let total = 0;
  let guestQueues = 0;
  let onlineQueues = 0;

  for (const plan of dayPlans) {
    const queueDate = startOfDay(addDays(today, plan.dayOffset));
    const dayKey = toIsoDate(queueDate);
    const statuses = statusListFromPlan(plan);
    const dutyStaffId = dutySeed.scheduleByDate.get(dayKey) ?? null;
    const adminPool = [seededUsers.admin.id, ...seededUsers.officers.slice(0, 4).map((u) => u.id)];

    for (let index = 0; index < statuses.length; index++) {
      const queueNumber = index + 1;
      const status = statuses[index];
      const isGuestQueue = index < plan.guestCount;
      const queueType = index % 3 === 0 ? QueueType.ONLINE : QueueType.OFFLINE;
      const purpose = purposeList[(profileIndex + index) % purposeList.length];
      const profile = createProfile(profileIndex, purpose);
      const createdAt = addMinutes(atTime(queueDate, 8, 0), index * 11);

      const visitor = await prisma.visitor.create({
        data: {
          name: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          age: profile.age,
          gender: profile.gender,
          lastEducation: profile.lastEducation,
          occupation: profile.occupation,
          institution: profile.institution,
          email: profile.email,
          purpose: profile.purpose,
          createdAt,
        },
      });

      let guestId: string | null = null;
      if (isGuestQueue) {
        const guest = await prisma.guest.create({
          data: {
            fullName: profile.fullName,
            email: profile.email,
            address: profile.address,
            phone: profile.phone,
            age: profile.age,
            institution: profile.institution,
            gender: profile.gender,
            lastEducation: profile.lastEducation,
            occupation: profile.occupation,
            purpose: profile.purpose,
            createdAt,
          },
        });
        guestId = guest.id;
        guestQueues++;
      }

      const serviceId = isGuestQueue
        ? serviceByPurpose[profile.purpose].id
        : activeServiceIds[index % activeServiceIds.length];

      let adminId: string | null = null;
      let startTime: Date | null = null;
      let endTime: Date | null = null;

      if (status === QueueStatus.COMPLETED) {
        adminId = adminPool[(index + Math.abs(plan.dayOffset)) % adminPool.length];
        startTime = addMinutes(createdAt, 4 + (index % 17));
        endTime = addMinutes(startTime, 8 + (index % 25));
      } else if (status === QueueStatus.SERVING) {
        adminId = adminPool[(index + Math.abs(plan.dayOffset)) % adminPool.length];
        startTime = addMinutes(createdAt, 3 + (index % 10));
      } else if (status === QueueStatus.CANCELED && index % 2 === 0) {
        adminId = adminPool[(index + Math.abs(plan.dayOffset)) % adminPool.length];
        startTime = addMinutes(createdAt, 2 + (index % 8));
        endTime = addMinutes(startTime, 4 + (index % 7));
      }

      const trackingLink = `track-${dayKey}-${String(queueNumber).padStart(3, "0")}`;
      let tempUuid: string | null = null;

      if (queueType === QueueType.ONLINE) {
        tempUuid = crypto.randomUUID();
        tempVisitorLinks.push({
          uuid: tempUuid,
          expiresAt: addDays(createdAt, 1),
          createdAt,
          updatedAt: createdAt,
          used: true,
        });
        onlineQueues++;
      }

      await prisma.queue.create({
        data: {
          queueNumber,
          status,
          queueType,
          queueDate,
          visitorId: visitor.id,
          guestId,
          serviceId,
          adminId,
          dutyStaffId,
          startTime,
          endTime,
          tempUuid,
          filledSKD:
            status === QueueStatus.COMPLETED
              ? index % 3 === 0
              : status === QueueStatus.SERVING
                ? false
                : status === QueueStatus.CANCELED
                  ? index % 4 === 0
                  : false,
          trackingLink,
          createdAt,
        },
      });

      statusCount[status]++;
      total++;

      snapshots.push({
        queueNumber,
        queueDate,
        status,
        queueType,
        serviceName:
          Object.values(serviceByPurpose).find((service) => service.id === serviceId)?.name ??
          "Layanan",
        visitorName: profile.fullName,
        adminId,
        createdAt,
      });

      profileIndex++;
    }
  }

  for (let index = 0; index < 3; index++) {
    const now = addMinutes(new Date(), index + 1);
    tempVisitorLinks.push({
      uuid: crypto.randomUUID(),
      expiresAt: addDays(now, 1),
      createdAt: now,
      updatedAt: now,
      used: false,
    });
  }

  await prisma.tempVisitorLink.createMany({
    data: tempVisitorLinks,
  });

  return {
    total,
    guestQueues,
    onlineQueues,
    statusCount,
    snapshots: snapshots.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
}

async function seedNotifications(seededUsers: SeededUsers, queueSeed: QueueSeedResult) {
  const notificationRows: Prisma.NotificationCreateManyInput[] = [];
  const recentQueues = queueSeed.snapshots.slice(0, 14);

  for (const queue of recentQueues) {
    const queueCode = `${queue.queueNumber}-${toQueueDateCode(queue.queueDate)}`;
    const queueChannel = queue.queueType === QueueType.ONLINE ? "Online" : "Offline";

    if (queue.status === QueueStatus.WAITING) {
      notificationRows.push({
        type: "NEW_QUEUE",
        title: "Antrean Baru",
        message: `Antrean baru #${queueCode} (${queueChannel}) dari ${queue.visitorName} untuk layanan ${queue.serviceName}`,
        isRead: false,
      });
      continue;
    }

    if (queue.status === QueueStatus.SERVING) {
      notificationRows.push({
        type: "QUEUE_SERVING",
        title: "Antrean Sedang Dilayani",
        message: `Antrean #${queueCode} (${queueChannel}) sedang dilayani pada layanan ${queue.serviceName}`,
        isRead: false,
      });
      continue;
    }

    if (queue.status === QueueStatus.COMPLETED) {
      notificationRows.push({
        type: "QUEUE_COMPLETED",
        title: "Antrean Selesai",
        message: `Antrean #${queueCode} (${queueChannel}) telah selesai dilayani untuk layanan ${queue.serviceName}`,
        isRead: false,
        userId: queue.adminId ?? seededUsers.admin.id,
      });
      continue;
    }

    notificationRows.push({
      type: "QUEUE_CANCELED",
      title: "Antrean Dibatalkan",
      message: `Antrean #${queueCode} (${queueChannel}) dibatalkan untuk layanan ${queue.serviceName}`,
      isRead: false,
      userId: queue.adminId ?? null,
    });
  }

  notificationRows.push({
    type: "DUTY_REMINDER_SENT",
    title: "Pengingat Jadwal PST",
    message: "Pengingat jadwal hari ini berhasil dikirim ke petugas jaga.",
    isRead: false,
  });

  notificationRows.push({
    type: "DUTY_REMINDER_FAILED",
    title: "Pengingat Jadwal PST Gagal",
    message: "Sebagian pengingat jadwal gagal karena nomor WhatsApp belum tersedia.",
    isRead: false,
    userId: seededUsers.admin.id,
  });

  await prisma.notification.createMany({
    data: notificationRows,
  });
}

async function main() {
  await ensureQrCode();
  await cleanupTransactionalData();
  const serviceByPurpose = await seedServices();
  const seededUsers = await seedUsers();
  const dutySeed = await seedDutyData(seededUsers.officers);
  const queueSeed = await seedQueues(serviceByPurpose, seededUsers, dutySeed);
  await seedNotifications(seededUsers, queueSeed);

  const generatedCreds = seededUsers.credentials.filter(
    (cred) => typeof cred.passwordHint === "string"
  );

  if (generatedCreds.length > 0) {
    console.log("Generated development credentials (store them securely if you keep this data):");
    generatedCreds.forEach((cred) => {
      console.log(`- ${cred.role}: username=${cred.username}, password=${cred.passwordHint}`);
    });
  } else {
    console.log("Seeded users with passwords supplied via environment variables (not logged).");
  }

  console.log(
    `Users seeded: admin=1, petugas=${seededUsers.officers.length} (target: ${PST_OFFICER_SEEDS.length})`
  );
  console.log(
    `Queues seeded: total=${queueSeed.total}, waiting=${queueSeed.statusCount.WAITING}, serving=${queueSeed.statusCount.SERVING}, completed=${queueSeed.statusCount.COMPLETED}, canceled=${queueSeed.statusCount.CANCELED}`
  );
  console.log(
    `Guestbook coverage: guest queues=${queueSeed.guestQueues}, online queues=${queueSeed.onlineQueues}`
  );

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
