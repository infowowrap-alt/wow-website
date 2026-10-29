import type { Metadata } from "next";
import "./globals.css";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export const metadata: Metadata = {
  title: {
    default: "WOW · L'Artigiano delle Pellicole",
    template: "%s · WOW",
  },
  description: "Pellicole e wrapping a Brindisi: WOW Interior Design per casa e negozi, WOW Big Sun Garage per i veicoli.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>
        <TransitionProvider>{children}</TransitionProvider>
        <SmoothScroll />
      </body>
    </html>
  );
}
