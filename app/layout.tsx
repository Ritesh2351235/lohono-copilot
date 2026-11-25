import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { StoreProvider } from "@/components/store";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Lohono Copilot — after-call assistant",
  description: "Prototype: an LLM assistant that turns villa sales and support conversations into tagged leads, next actions and escalations.",
};
export const viewport: Viewport = { themeColor: "#f5f5f7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
