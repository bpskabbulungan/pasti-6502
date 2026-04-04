import type { Metadata } from "next";
import VisitorFormPreloadPage from "@/features/visitor-form/screens/visitor-form-preload-screen";

export const metadata: Metadata = {
	title: "Pramuat Formulir Pengunjung",
};

export default function Page() {
	return <VisitorFormPreloadPage />;
}


