"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/settings/agency", label: "Agency Profile" },
  { href: "/settings/style", label: "Communication Style" },
  { href: "/settings/email", label: "Email Connection" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/notifications", label: "Notifications" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row h-full pb-14 lg:pb-0">
      {/* Sub-sidebar */}
      <aside className="md:w-52 md:border-r shrink-0">
        <div className="px-4 py-3 border-b md:border-b-0">
          <h2 className="text-base font-semibold md:mb-3">Settings</h2>
          <nav className="flex gap-1 md:flex-col overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
