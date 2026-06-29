"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Menu } from "lucide-react";

export function Header() {
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="hidden sm:flex items-center text-sm text-muted-foreground">
          <span>Trang chủ</span>
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Tìm kiếm">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Thông báo">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Tài khoản">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
