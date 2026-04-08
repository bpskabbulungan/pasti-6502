import prisma from "@api/infrastructure/database/prisma";

const DEFAULT_SKD_TEMPLATE = `Halo {nama}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) BPS Bulungan melalui link berikut: {link}`;

export async function getSkdTemplate() {
	try {
		const existing = await prisma.skdTemplate.findUnique({
			where: { id: "default" },
		});

		if (existing) {
			return {
				ok: true,
				template: existing.template,
			};
		}

		// Create default template if not found
		const created = await prisma.skdTemplate.create({
			data: {
				id: "default",
				template: DEFAULT_SKD_TEMPLATE,
			},
		});

		return {
			ok: true,
			template: created.template,
		};
	} catch (error) {
		console.error("Error fetching SKD template:", error);
		return {
			ok: false,
			error: "Failed to fetch SKD template",
		};
	}
}

export async function updateSkdTemplate(template: string) {
	if (!template || !template.trim()) {
		return {
			ok: false,
			error: "Template cannot be empty",
		};
	}

	try {
		const updated = await prisma.skdTemplate.upsert({
			where: { id: "default" },
			update: { template: template.trim() },
			create: {
				id: "default",
				template: template.trim(),
			},
		});

		return {
			ok: true,
			template: updated.template,
		};
	} catch (error) {
		console.error("Error updating SKD template:", error);
		return {
			ok: false,
			error: "Failed to update SKD template",
		};
	}
}
