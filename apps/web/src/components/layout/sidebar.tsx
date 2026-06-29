"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronDown,
  LogOut,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  { title: "Tổng quan", href: "/", icon: LayoutDashboard },
  {
    title: "Tuyển dụng",
    href: "/tuyen-dung",
    icon: UserPlus,
    children: [
      { title: "Pipeline", href: "/tuyen-dung" },
      { title: "Ứng viên", href: "/tuyen-dung/ung-vien" },
      { title: "Tin tuyển dụng", href: "/tuyen-dung/tin-tuyen-dung" },
      { title: "Lịch phỏng vấn", href: "/tuyen-dung/lich-phong-van" },
    ],
  },
  {
    title: "Nhân sự",
    href: "/nhan-su",
    icon: Users,
    children: [
      { title: "Danh sách nhân viên", href: "/nhan-su" },
      { title: "Thêm nhân viên", href: "/nhan-su/them-moi" },
    ],
  },
  // { title: "Chấm công", href: "/cham-cong", icon: Clock },
  // { title: "Tiền lương", href: "/tien-luong", icon: Wallet },
  { title: "Hợp đồng", href: "/hop-dong", icon: FileText },
  {
    title: "Tài xế",
    href: "/tai-xe",
    icon: Truck,
    children: [
      { title: "Danh sách tài xế", href: "/tai-xe" },
      { title: "GPLX", href: "/tai-xe?tab=gplx" },
      { title: "Điều động", href: "/tai-xe?tab=dieu-dong" },
    ],
  },
  { title: "Tài sản", href: "/tai-san", icon: Package },
  { title: "KPI", href: "/kpi", icon: Target },
  { title: "Biểu mẫu", href: "/bieu-mau", icon: FileStack },
  { title: "Báo cáo", href: "/bao-cao", icon: BarChart3 },
  { title: "Cài đặt", href: "/cai-dat", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Nam Thắng</h1>
        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded">
          HRM
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedItems.includes(item.title) && "rotate-180"
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.title) && (
                    <ul className="ml-7 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-3 py-1.5 rounded-md text-sm transition-colors",
                              pathname === child.href
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">NT</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-muted-foreground truncate">admin@namthang.com</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground" aria-label="Đăng xuất">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
