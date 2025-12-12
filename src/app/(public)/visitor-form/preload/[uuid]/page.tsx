import { redirect } from "next/navigation";

export default async function PreloadPage({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const { uuid } = await params;
	// This page will redirect to the preload page which will then redirect to the actual form
	redirect(`/visitor-form/preload?uuid=${uuid}`);
}
