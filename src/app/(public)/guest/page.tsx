import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import GuestForm from "./guest-form";

export const metadata: Metadata = {
	title: "Buku Tamu PST 6502",
	description:
		"Halaman buku tamu untuk pengunjung PST BPS Bulungan. Scan QR langsung ke pasti.databenuanta.id/guest.",
};

export default function GuestPage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
			<div className="pointer-events-none absolute left-1/2 top-[-6rem] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
			<div className="pointer-events-none absolute right-6 top-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
			<div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
				<div className="space-y-3 text-center md:space-y-4">
					<div className="flex items-center justify-center gap-2">
						<Badge variant="outline" className="bg-primary/15">
							Akses publik /guest
						</Badge>
						<Badge variant="outline" className="bg-secondary/30">
							QR &amp; Barcode ready
						</Badge>
					</div>
					<h1 className="text-3xl font-bold text-foreground md:text-4xl">
						Buku Tamu PST Bulungan
					</h1>
					<p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
						Pengunjung dapat mengisi data dari gawai masing-masing dengan
						memindai QR yang menuju{" "}
						<span className="font-semibold text-foreground">
							https://simatriks.databenuanta.id/guest
						</span>
						. Setelah dikirim, sistem mencatat buku tamu dan membuat nomor
						antrean otomatis.
					</p>
				</div>
				<GuestForm />
			</div>
		</main>
	);
}
