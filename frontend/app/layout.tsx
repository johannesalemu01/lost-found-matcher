import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { RoleProvider } from "@/context/RoleContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Lost & Found Matcher",
  description: "Report lost and found items on campus. We suggest likely matches; staff verify ownership before handover.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <ToastProvider>
            <Header />
            <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:pt-10">{children}</main>
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
