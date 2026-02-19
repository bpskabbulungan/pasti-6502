import "module-alias/register";
import { PrismaClient, Role, ServiceStatus } from "@prisma/client";
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
	throw new Error(
		"Database seeding is disabled in production to prevent accidental data loss."
	);
}

if (!staticUuid) {
	throw new Error(
		"NEXT_PUBLIC_STATIC_UUID environment variable must be defined for QR generation."
	);
}
const resolvedStaticUuid: string = staticUuid;

if (!baseUrl) {
	throw new Error(
		"NEXTAUTH_URL environment variable must be defined to generate QR codes."
	);
}
const resolvedBaseUrl: string = baseUrl;

type SeededCredential = {
	role: Role;
	username: string;
	password?: string;
	source: string;
};

const resolvePassword = (
	envKey: string
): { password: string; fromEnv: boolean } => {
	const envPassword = process.env[envKey];
	if (envPassword) {
		return { password: envPassword, fromEnv: true };
	}

	return {
		password: crypto.randomBytes(18).toString("base64url"),
		fromEnv: false,
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
	const qrCodeUrl = `${normalizedBaseUrl}/visitor-form/${resolvedStaticUuid}`;

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

	console.log(
		`QR Code created at ${qrCodePath}, with UUID: ${qrCode.staticUuid}`
	);
}

async function seedUsers(): Promise<SeededCredential[]> {
	const credentials: SeededCredential[] = [];

	const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
	const { password: adminPassword, fromEnv: adminFromEnv } = resolvePassword(
		"SEED_ADMIN_PASSWORD"
	);
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
		password: adminFromEnv ? undefined : adminPassword,
		source: adminFromEnv ? "SEED_ADMIN_PASSWORD" : "generated",
	});

	const operatorUsername = process.env.SEED_OPERATOR_USERNAME || "petugas";
	const {
		password: operatorPassword,
		fromEnv: operatorFromEnv,
	} = resolvePassword("SEED_OPERATOR_PASSWORD");
	const operatorHashedPassword = await bcryptjs.hash(operatorPassword, 12);

	const operator = await prisma.user.upsert({
		where: { username: operatorUsername },
		update: {
			password: operatorHashedPassword,
			name: "Petugas PST",
			role: Role.PETUGAS,
		},
		create: {
			username: operatorUsername,
			password: operatorHashedPassword,
			name: "Petugas PST",
			role: Role.PETUGAS,
		},
	});

	credentials.push({
		role: Role.PETUGAS,
		username: operator.username,
		password: operatorFromEnv ? undefined : operatorPassword,
		source: operatorFromEnv ? "SEED_OPERATOR_PASSWORD" : "generated",
	});

	return credentials;
}

async function seedServices() {
	const services = [
		{ name: "Perpustakaan", status: ServiceStatus.ACTIVE },
		{ name: "Konsultasi Statistik", status: ServiceStatus.ACTIVE },
		{ name: "Rekomendasi Statistik", status: ServiceStatus.ACTIVE },
	];

	for (const serviceData of services) {
		const existingService = await prisma.service.findFirst({
			where: { name: serviceData.name },
		});

		if (existingService) {
			const service = await prisma.service.update({
				where: { id: existingService.id },
				data: {
					status: serviceData.status,
				},
				select: {
					name: true,
				},
			});
			console.log(`Updated service: ${service.name}`);
		} else {
			const service = await prisma.service.create({
				data: {
					name: serviceData.name,
					status: serviceData.status,
				},
				select: {
					name: true,
				},
			});
			console.log(`Created service: ${service.name}`);
		}
	}
}

async function main() {
	await ensureQrCode();
	const seededCredentials = await seedUsers();
	await seedServices();

	const generatedCreds = seededCredentials.filter(
		(cred) => typeof cred.password === "string"
	);

	if (generatedCreds.length > 0) {
		console.log(
			"Generated development credentials (store them securely if you keep this data):"
		);
		generatedCreds.forEach((cred) => {
			console.log(
				`- ${cred.role}: username=${cred.username}, password=${cred.password}`
			);
		});
	} else {
		console.log(
			"Seeded users with passwords supplied via environment variables (not logged)."
		);
	}

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
