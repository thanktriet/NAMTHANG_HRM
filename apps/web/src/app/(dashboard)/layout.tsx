"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <MobileNav />
      <div className="lg:pl-[260px]">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
