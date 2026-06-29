"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Clock,
  Wallet,
  FileText,
  Truck,
  Package,
  Target,
  FileStack,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { title: "Tổng quan", href: "/", icon: LayoutDashboard },
  { title: "Tuyển dụng", href: "/tuyen-dung", icon: UserPlus },
  { title: "Nhân sự", href: "/nhan-su", icon: Users },
  { title: "Chấm công", href: "/cham-cong", icon: Clock },
  { title: "Tiền lương", href: "/tien-luong", icon: Wallet },
  { title: "Hợp đồng", href: "/hop-dong", icon: FileText },
  { title: "Tài xế", href: "/tai-xe", icon: Truck },
  { title: "Tài sản", href: "/tai-san", icon: Package },
  { title: "KPI", href: "/kpi", icon: Target },
  { title: "Biểu mẫu", href: "/bieu-mau", icon: FileStack },
  { title: "Báo cáo", href: "/bao-cao", icon: BarChart3 },
  { title: "Cài đặt", href: "/cai-dat", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebarStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />

      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 w-[280px] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">Nam Thắng</h1>
            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded">
              HRM
            </span>
          </div>
          <button onClick={toggleSidebar} aria-label="Đóng menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={toggleSidebar}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
