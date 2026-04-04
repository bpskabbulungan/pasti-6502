import type { Metadata } from "next";
import VisitorFormPage from "@/features/visitor-form/screens/visitor-form-screen";

export const metadata: Metadata = {
	title: "Formulir Pengunjung",
};

export default function Page() {
	return <VisitorFormPage />;
}


