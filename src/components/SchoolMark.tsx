import logo from "@/assets/school_logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

export function SchoolLogo({ className }: { className?: string }) {
  return <img src={logo.url} alt="Sri Ramakrishna Sharadadevi Vidyamandira logo" className={cn("rounded-full bg-card object-cover ring-2 ring-gold/70", className)} />;
}
