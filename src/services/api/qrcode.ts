import { apiFetch } from "./base-client";

type StaticUuidResponse = {
	ok: boolean;
	staticUuid: string;
	source: "env" | "database" | "generated";
};

export const qrApi = {
	getStaticUuid: () => apiFetch<StaticUuidResponse>("/api/qrcode/static-uuid"),
	getImageUrl: (uuid: string) =>
		`/api/qrcode/image?uuid=${encodeURIComponent(uuid)}`,
	downloadImage: async (imageUrl: string) => {
		const res = await fetch(imageUrl);
		if (!res.ok) {
			throw new Error("Failed to fetch QR code image");
		}
		return res.blob();
	},
};
