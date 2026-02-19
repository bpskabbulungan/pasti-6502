import CurrentYear from "@/components/current-year";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-white/10 py-4 text-center text-xs text-secondary-color backdrop-blur dark:bg-background/10">
      <p>
        © <CurrentYear /> Badan Pusat Statistik Kabupaten Bulungan
      </p>
    </footer>
  );
}
