import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WOW · L'Artigiano delle Pellicole",
    template: "%s · WOW",
  },
  description: "Pellicole e wrapping a Brindisi: WOW Interior Design per casa e negozi, WOW Big Sun Garage per i veicoli.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
