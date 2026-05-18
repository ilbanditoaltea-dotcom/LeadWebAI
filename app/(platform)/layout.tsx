import type { ReactNode } from "react";
import { Header } from "@/app/components/layout/header";
import { Sidebar } from "@/app/components/layout/sidebar";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="lg:pl-[18.5rem]">
        <Header />
        <main className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
