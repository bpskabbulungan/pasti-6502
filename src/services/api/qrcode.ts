import { apiFetch } from "./base-client";

export const qrApi = {
	getStaticUuid: () => apiFetch("/api/qrcode/static-uuid"),
};
